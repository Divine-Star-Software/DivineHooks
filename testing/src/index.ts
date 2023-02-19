import { TagManager } from "../out/TagManager.js";
import { RemoteTagManager } from "../out/RemoteTagManager.js";
const manager = new TagManager("main");
manager.registerTag({
  id: "#dbt:headedr",
  type: "header",
  numberType: "16ui",
});
manager.registerTag({
  id: "#dbt:tnum1",
  type: "typed-number",
  numberType: "8ui",
});
manager.registerTag({
  id: "#dbt:tnum2",
  type: "typed-number",
  numberType: "32ui",
});
manager.registerTag({
  id: "#dbt:num-array",
  type: "typed-number-array",
  numberType: "8ui",
  length: 10,
});

manager.registerTag({ id: "#dbt:bool1", type: "boolean" });
manager.registerTag({ id: "#dbt:bool2", type: "boolean" });
manager.registerTag({ id: "#dbt:num1", type: "number", range: [0, 15] });
manager.registerTag({ id: "#dbt:num2", type: "number", range: [0, 15] });

const numIndexes = 3;
const data = manager.$INIT({ numberOfIndexes: numIndexes });

const buffer = new ArrayBuffer(data.bufferSize);
data.buffer = buffer;
manager.setBuffer(buffer);
manager.setTag("#dbt:headedr", 1);
manager.setTag("#dbt:bool1", 1);
manager.setTag("#dbt:num1", 15);
manager.setTag("#dbt:tnum1", 16_000);

manager.loopThroughAllIndexTags(() => {
  manager.setTag("#dbt:tnum1", (Math.random() * 255) >> 0);
  manager.setTag("#dbt:tnum2", (Math.random() * 10_000) >> 0);
});

console.log("[MAIN]");
manager.loopThroughAllIndexTags((id, value, index) => {
  console.log([index], id, "=>", value);
});

const remoteManager = new RemoteTagManager("remote");

remoteManager.$INIT(data);
console.log("[REMOTE]");
remoteManager.loopThroughAllIndexTags((id, value, index) => {
  console.log([index], id, "=>", value);
});

manager.setArrayTagValue("#dbt:num-array", 0, 2);
manager.setArrayTagValue("#dbt:num-array", 1, 10);
console.log(manager.getArrayTagValue("#dbt:num-array", 0));
console.log(manager.getArrayTagValue("#dbt:num-array", 1));
