import { TagManagerBase } from "./TagManagerBase.js";
export class RemoteTagManager extends TagManagerBase {
    $INIT(data) {
        this.data = new DataView(data.buffer);
        this.index = new DataView(data.indexBuffer);
        this.indexMap = data.indexMap;
        this.tagIndexes = data.totalIndexes;
        this.tagSize = data.tagSize;
    }
}
