import { DBTUtil } from "../Util/DBTUtil.js";
import { TagManagerBase } from "./TagManagerBase.js";
const TagNodeTypes = {
    boolean: 0,
    number: 1,
    typedNumber: 2,
};
const TagIndexSize = DBTUtil.getNumberTypesize("32ui") + DBTUtil.getNumberTypesize("8ui") * 3;
const setIndexData = (data, indexBufferIndex, byteIndex, bitOffSet, bitSize, type) => {
    data.setUint32(indexBufferIndex, byteIndex);
    indexBufferIndex += DBTUtil.getNumberTypesize("32ui");
    data.setUint8(indexBufferIndex, bitOffSet);
    indexBufferIndex += DBTUtil.getNumberTypesize("8ui");
    data.setUint8(indexBufferIndex, bitSize);
    indexBufferIndex += DBTUtil.getNumberTypesize("8ui");
    data.setUint8(indexBufferIndex, type);
    indexBufferIndex += DBTUtil.getNumberTypesize("8ui");
    return indexBufferIndex;
};
export class TagManager extends TagManagerBase {
    schema = new Map();
    registerTag(tagData) {
        this.schema.set(tagData.id, tagData);
    }
    $INIT(initData) {
        //process schema
        const booleans = [];
        const numbers = [];
        const typedNumbers = new Map();
        this.schema.forEach((tag) => {
            if (tag.type == "boolean") {
                booleans.push(tag);
            }
            if (tag.type == "number") {
                const range = tag.range;
                const bitSize = DBTUtil.calculateBitsNeeded(range[0], range[1]);
                numbers[bitSize] ??= [];
                numbers[bitSize].push(tag);
            }
            if (tag.type == "typed-number") {
                const type = tag.numberType;
                let tags = typedNumbers.get(tag.numberType);
                if (!tags) {
                    tags = [];
                    typedNumbers.set(tag.numberType, tags);
                }
                tags.push(tag);
            }
        });
        //build index
        const indexSize = this.schema.size * TagIndexSize;
        let indexBuffer = new ArrayBuffer(indexSize);
        if (initData?.indexBufferMode == "shared") {
            indexBuffer = new SharedArrayBuffer(indexSize);
        }
        const index = new DataView(indexBuffer);
        this.index = index;
        let indexBufferIndex = 0;
        let byteIndex = 0;
        let bitIndex = 0;
        let bitSize = 1;
        for (let i = 0; i < booleans.length; i++) {
            const bool = booleans[i];
            this.indexMap.set(bool.id, indexBufferIndex);
            indexBufferIndex = setIndexData(index, indexBufferIndex, byteIndex, bitIndex, bitSize, TagNodeTypes.boolean);
            bitIndex++;
            if (bitIndex >= 8) {
                byteIndex++;
                bitIndex = 0;
            }
        }
        bitIndex = 0;
        let cachedBitSize = 0;
        numbers.forEach((tags, bitS) => {
            bitSize = bitS;
            if (cachedBitSize != bitSize) {
                byteIndex++;
            }
            for (let i = 0; i < tags.length; i++) {
                const tag = tags[i];
                this.indexMap.set(tag.id, indexBufferIndex);
                indexBufferIndex = setIndexData(index, indexBufferIndex, byteIndex, bitIndex, bitSize, TagNodeTypes.number);
                bitIndex += bitSize;
                if (bitIndex >= 8) {
                    byteIndex++;
                    bitIndex = 0;
                }
            }
        });
        bitIndex = 0;
        typedNumbers.forEach((tags, type) => {
            const byteSise = DBTUtil.getNumberTypesize(type);
            bitSize = byteSise * 8;
            for (let i = 0; i < tags.length; i++) {
                const tag = tags[i];
                this.indexMap.set(tag.id, indexBufferIndex);
                indexBufferIndex = setIndexData(index, indexBufferIndex, byteIndex, bitIndex, byteSise, TagNodeTypes.typedNumber);
                bitIndex += bitSize;
                byteIndex += byteSise;
            }
        });
        let numberOfIndexes = 1;
        if (initData?.numberOfIndexes) {
            numberOfIndexes = initData.numberOfIndexes;
        }
        this.tagIndexes = numberOfIndexes;
        this.tagSize = byteIndex;
        return {
            bufferSize: byteIndex * numberOfIndexes,
            buffer: new ArrayBuffer(0),
            indexBuffer: indexBuffer,
            indexMap: this.indexMap,
            tagSize: this.tagSize,
            totalIndexes: numberOfIndexes
        };
    }
}
