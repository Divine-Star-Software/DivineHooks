import { DBTSchema, DBTTagNodes } from "Meta/DBTSchema.tyeps";
import { RemoteTagManagerInitData } from "Meta/Util.types.js";
import { TagManagerBase } from "./TagManagerBase.js";
declare type TagManagerInitData = {
    indexBufferMode?: "normal" | "shared";
    numberOfIndexes?: number;
};
export declare class TagManager extends TagManagerBase {
    schema: DBTSchema;
    registerTag(tagData: DBTTagNodes): void;
    $INIT(initData?: TagManagerInitData): RemoteTagManagerInitData;
}
export {};
