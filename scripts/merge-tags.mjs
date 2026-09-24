// One-time migration: merge fine-grained tags into broader ones.
// Usage: node scripts/merge-tags.mjs [--dry-run]
import { readFileSync, writeFileSync } from "node:fs";
import { readdirSync } from "node:fs";
import { basename, join } from "node:path";

const DRY_RUN = process.argv.includes("--dry-run");

const MERGE = {
  // MySQL
  InnoDB: "MySQL", MyISAM: "MySQL", MEMORY: "MySQL", 存储引擎: "MySQL",
  "B+树": "索引", 聚簇索引: "索引", 二级索引: "索引", 回表: "索引",
  覆盖索引: "索引", 索引下推: "索引", 最左前缀: "索引", 联合索引: "索引", 查询优化: "索引",
  MVCC: "事务", "Undo Log": "事务", ReadView: "事务", 隔离级别: "事务", 并发控制: "事务",
  间隙锁: "锁", 行锁: "锁", 意向锁: "锁", 死锁: "锁", 乐观锁: "锁", 悲观锁: "锁",
  // Java
  "JDK 8": "Java", Spring: "Java", IoC: "Java", AOP: "Java", "Bean 生命周期": "Java",
  集合框架: "Java", List: "Java", Set: "Java", Map: "Java",
  CAS: "并发编程", AQS: "并发编程", synchronized: "并发编程", ReentrantLock: "并发编程",
  ConcurrentHashMap: "并发编程",
  红黑树: "HashMap", 哈希碰撞: "HashMap", 扩容机制: "HashMap", 扩容: "HashMap", 数据结构: "HashMap",
  // 消息队列
  Kafka: "消息队列", RocketMQ: "消息队列", NameServer: "消息队列", ZooKeeper: "消息队列",
  服务发现: "消息队列", 消费者组: "消息队列", 死信交换机: "消息队列", 死信队列: "消息队列",
  DLX: "消息队列", TTL: "消息队列", 延迟队列: "消息队列", 消息可靠性: "消息队列",
  发布订阅: "消息队列", 解耦: "消息队列", 异步: "消息队列", 削峰: "消息队列", 最终一致性: "消息队列",
  // 密码学
  信息安全: "密码学", 对称加密: "密码学", 非对称加密: "密码学", 分组密码: "密码学",
  Feistel: "密码学", SPN: "密码学", AES: "密码学", DES: "密码学", 古典密码: "密码学",
  置换: "密码学", 代换: "密码学", 一次一密: "密码学", OTP: "密码学", 完善保密: "密码学",
  异或: "密码学", PRG: "密码学", 流密码: "密码学",
  // AI
  上下文工程: "AI Agent", 上下文压缩: "AI Agent", RAG: "AI Agent", 记忆管理: "AI Agent",
  "Coding Agent": "AI Agent", ReAct: "AI Agent", 任务规划: "AI Agent", 工具调用: "AI Agent",
  "Spec Coding": "AI 编程", 软件工程: "AI 编程", 学习: "AI 编程",
  // 网络 / 分布式
  TCP: "计算机网络", 网络协议: "计算机网络",
  "Redis Cluster": "Redis", 哈希槽: "Redis",
  共识机制: "区块链", 智能合约: "区块链",
  // 算法
  哈希集合: "哈希表", 查找: "哈希表", 染色: "图", 剪枝: "回溯",
  排序: "数组", 模拟: "字符串", 树状数组: "数组", 离散化: "数组",
  // 运维
  "Route 53": "AWS", CloudFront: "AWS", VPN: "网络安全", 服务器安全: "网络安全",
  WireGuard: "网络安全", SSH: "Linux", 故障复盘: "Cloudflare",
  // 示例 / 主题演示
  视频: "示例", Fuwari: "示例", 自定义: "示例",
};

function parseTags(raw) {
  let inner = raw.trim().replace(/^\[/, "").replace(/\]$/, "").trim();
  if (inner === "") return [];
  if (inner.startsWith('"')) {
    return inner.split(/"\s*,\s*"/).map((s) => s.replace(/^"|"$/g, "").trim()).filter(Boolean);
  }
  return inner.split(",").map((s) => s.trim()).filter(Boolean);
}

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : e.name.endsWith(".md") ? [join(dir, e.name)] : []
  );
}
const files = walk("src/content/posts");

let changed = 0;
for (const file of files) {
  const content = readFileSync(file, "utf8");
  const m = content.match(/^tags:\s*(\[.*\])\s*$/m);
  if (!m) { console.log(`SKIP (no tags line): ${file}`); continue; }
  const isJavaPost = file.includes("interview") && file.replaceAll("\\", "/").includes("/Java/");
  const tags = parseTags(m[1]).map((t) => {
    if (t === "锁" && isJavaPost) return "并发编程";
    return MERGE[t] ?? t;
  });
  const merged = [...new Set(tags)];
  if (JSON.stringify(tags) === JSON.stringify(parseTags(m[1]))) continue;
  const updated = content.replace(m[0], `tags: [${merged.join(", ")}]`);
  if (!DRY_RUN) writeFileSync(file, updated);
  changed++;
  console.log(`${basename(file)}: [${parseTags(m[1]).join(", ")}] -> [${merged.join(", ")}]`);
}

console.log(`\n${DRY_RUN ? "[dry-run] " : ""}${changed} files updated.`);
