---
title: Jev 入门：TypeSafe AI 的 System One 模型与 LLM 有什么不同
published: 2026-09-26
description: 基于 TypeSafe AI 官方文档，介绍 Jev、System One、Choice/Score/Noul 三类问题、置信度，以及如何通过 API 和 Python SDK 使用 Jev。
tags: [Jev, LLM]
category: 学习
draft: false
---

最近看到 Jev 这个名字，很多人的第一反应是：它是不是又一个 LLM？按照 TypeSafe AI 官方文档的定义，Jev 是 TypeSafe 的旗舰模型，也是第一个 **System One model**。它的目标不是生成一段给人阅读的文本，而是针对一个状态（state）回答一组类型明确的问题，让软件可以直接消费结果。

官方给出的核心抽象很简洁：

```text
state + typed questions → typed answers + probabilities + confidence
```

这也是理解 Jev 的关键。它不是把 LLM 的回答再用正则表达式或 JSON 解析器“加工”成结构化结果，而是从模型接口和输出目标上就围绕结构化决策设计。

> 本文中的模型能力、接口、字段和代码均以 [TypeSafe AI 官方文档](https://docs.typesafe.ai/introduction) 和官方发布文章为准。Jev 目前处于 early access，具体模型别名和价格应以官方文档为准。

## Jev 是什么

TypeSafe AI 把 System One 模型定义为：**为软件快速做出结构化决策的 AI 模型**。Jev 接收一段状态和若干问题，然后返回预先约束好的答案。

这里的 state 可以是一段文本，也可以是 JSON 对象或文本数组。例如，一个客服工单的 state 可以包含：

```json
{
  "ticket": {
    "message": "我的银行卡被重复扣款了，请帮我退款。",
    "sender": "customer"
  },
  "order": {
    "id": "A-104",
    "charges": [
      {"amount_usd": 49, "status": "captured"},
      {"amount_usd": 49, "status": "captured"}
    ]
  },
  "refund_policy": "重复扣款可以退款。"
}
```

然后，我们不让模型自由发挥，而是明确提出几个独立的问题：

- 这是什么类型的工单？
- 用户是否明确要求退款？
- 这条消息是否表达了紧迫性？
- 客户的挫败程度是多少？

Jev 会对这些问题分别作答。多个问题可以放在同一次请求中，并且会针对同一个 state 独立、并行地评估。

## 三种官方问题原语

官方文档目前提供三种核心 primitive。它们不是三种不同的模型，而是三种不同的提问方式。

| 类型 | 用来问什么 | 返回什么 | 适合的场景 |
| --- | --- | --- | --- |
| `Choice` | 从若干选项中选择一个 | `choice`、`probabilities`、`confidence` | 分类、路由、意图识别 |
| `Score` | 按评分标准衡量状态 | `score`、`probabilities`、`confidence` | 情绪、质量、风险、优先级 |
| `Noul` | 某个陈述是否成立 | `noul`，取值 0 到 1 | 判断、检测、验证 |

例如，`Choice` 可以回答“哪个团队负责这个工单”，`Score` 可以回答“客户看起来有多生气”，`Noul` 可以回答“这条消息是否明确要求退款”。

官方建议把复杂判断拆成多个原子问题。与其直接问“请给这个销售方案打分”，不如分别询问市场规模、技术可行性和差异化程度，再在自己的代码中组合结果。这样，权重和业务规则属于应用程序，而不是藏在一个难以测试的长提示词里。

## Jev 和 LLM 的区别

Jev 和 LLM 都可以理解自然语言，但它们的接口目标不同。

| 对比维度 | LLM | Jev / System One |
| --- | --- | --- |
| 主要输出 | 生成的字符串 | 类型明确的答案和概率 |
| 典型用途 | 对话、写作、代码生成、解释 | 分类、评分、判断、路由、验证 |
| 输出约束 | 输出空间很自由，通常需要解析和校验 | 问题预先定义答案结构 |
| 推理方式 | 逐 token 生成文本 | 对一组问题并行评估 |
| 不确定性 | 即使被要求说明置信度，也可能不稳定 | `Choice` 和 `Score` 返回置信度；概率也随答案返回 |
| 软件集成 | 需要把文本解析成程序可用的数据 | 结果可以直接进入分支、排序和路由 |

这里有一个容易混淆的地方：Jev 不是“不会犯错的规则引擎”。官方文档把它描述为经过校准的决策模型；置信度反映的是模型在整体预测上的不确定性校准，并不保证某一个具体答案一定正确。因此，应用仍然需要测试集、阈值和人工兜底。

Jev 目前也不是通用文本生成模型。官方文档明确说明，System One 模型不会写回复、生成代码或输出推理解释；Jev 当前接受文本输入，包括字符串、JSON 对象和文本数组，暂不支持图片、音频和视频。

## 最快的体验方式：Playground

官方 Quick Start 提供了 Playground 体验流程：

1. 打开 [TypeSafe Playground](https://console.typesafe.ai/playground) 并登录。
2. 把一段文本作为 state。
3. 添加一个问题，例如：`Does this message express urgency?`
4. 继续添加 `Choice`、`Score` 或 `Noul` 问题，查看同一次请求中的多个结果。

例如，一个 Noul 问题可以写成：

```json
{
  "urgency": {
    "type": "noul",
    "instructions": "Does this message express urgency?"
  }
}
```

Playground 适合验证问题表述和观察输出；真正接入应用时，则使用 API 或官方 SDK。

## 通过 HTTP API 使用 Jev

官方文档给出的 API endpoint 是：

```http
POST https://api.typesafe.ai/v1/systemone
Authorization: Bearer <API_KEY>
Content-Type: application/json
```

下面是官方 Quick Start 中的简化请求：

```bash
curl -X POST https://api.typesafe.ai/v1/systemone \
  -H "Authorization: Bearer $TYPESAFE_API_KEY" \
  -H "Content-Type: application/json" \
  -d @- <<'EOF'
{
  "state": "Hi, I've been trying to connect my Stripe account for 3 days and the integration keeps failing. I'm losing sales. Please help ASAP.",
  "model": "jev-latest",
  "questions": {
    "urgency": {
      "type": "noul",
      "instructions": "Does this message express urgency?"
    }
  }
}
EOF
```

返回结果中，`answers` 会按照问题名称给出对应答案。例如，`Choice` 会有 `choice`、`probabilities` 和 `confidence`，`Score` 会有 `score`、`probabilities` 和 `confidence`，而 `Noul` 会返回 0 到 1 的 `noul` 值。

## 通过 Python SDK 使用

官方 Quick Start 提供的 Python SDK 名称是 `typesafe-sdk`，要求 Python 3.10 或更高版本：

```bash
pip install typesafe-sdk
```

将 API key 放进 `TYPESAFE_API_KEY` 环境变量后，可以这样调用：

```python
from typesafe_sdk import Choice, Noul, Score, TypeSafeClient

client = TypeSafeClient()

ticket = (
    "Hi, I've been trying to connect my Stripe account for 3 days "
    "and the integration keeps failing. I'm losing sales. Please help ASAP."
)

response = client.system_one(
    state=ticket,
    questions={
        "department": Choice(
            instructions="Which team should handle this",
            criteria={
                "billing": "Payment or subscription issues",
                "technical": "Bugs or integration problems",
                "sales": "Pricing or account questions",
            },
        ),
        "frustration": Score(
            instructions="How frustrated the customer appears",
            criteria=[
                "Calm, just stating facts",
                "Frustrated but civil",
                "Very angry, strong language",
            ],
        ),
        "is_urgent": Noul(
            instructions="The message conveys urgency or time-sensitivity",
        ),
    },
)

print(response.answers["department"].choice)
print(response.answers["frustration"].score)
print(response.answers["is_urgent"].noul)
```

官方 SDK 默认使用 `jev-latest`。如果需要显式指定模型，可以根据 SDK 当前版本的接口传入模型配置；模型名称、可用别名和价格应以 [官方 Models 文档](https://docs.typesafe.ai/models) 为准。

## 把 Jev 接进业务系统

一个更可靠的集成方式，不是让 Jev 直接替代所有业务逻辑，而是让它负责那些传统规则难以覆盖、但输出空间可以被定义的问题：

```text
业务状态
   │
   ├── 确定性规则：直接在代码中处理
   │
   └── 需要判断的问题：交给 Jev 并行评估
                         │
                         ▼
              代码组合答案和概率
                         │
              ┌──────────┼──────────┐
              ▼          ▼          ▼
           自动处理    转人工    交给更强的推理模型
```

官方文档特别强调了几种实践方式：

- **问题原子化**：每个问题只判断一个清晰的维度。
- **一次多问**：同一个 state 上的多个问题可以并行执行，避免为每个判断发起一次串行请求。
- **代码组合**：用确定性逻辑或加权公式组合独立问题的结果。
- **按置信度路由**：高风险或低置信度结果转人工，或者交给更昂贵的推理模型。

例如，工单路由可以先用 `Choice` 选择团队，再用 `Noul` 判断是否请求退款，最后由代码根据置信度和业务阈值决定自动处理还是人工审核。

## Jev 适合什么，不适合什么

Jev 适合：

- 工单分类和路由；
- 文档或消息的结构化判断；
- 风险、质量、情绪等维度的评分；
- 对 LLM 的提示词、工具调用、推理过程或输出进行验证；
- 需要低延迟的实时应用；
- 对大规模数据进行特征提取和筛选。

Jev 不适合直接承担：

- 生成面向用户的长文本回复；
- 编写代码或解释复杂推理过程；
- 需要图片、音频或视频理解的任务；
- 把所有业务规则无条件交给模型的场景。

在这些场景中，Jev 更适合作为工作流中的判断节点，与 LLM、普通代码、数据库和人工审核配合使用。

## 总结

LLM 的基本输出是字符串，Jev 的基本输出是软件可以直接使用的类型化决策。Jev 通过 state 和 typed questions 描述问题，通过 `Choice`、`Score` 和 `Noul` 表达不同的判断形式，并把概率和置信度一起返回。

因此，Jev 的重点不是“生成更长的答案”，而是让 AI 更容易嵌入 `if`、排序、路由、验证和自动化流程。实际使用时，可以先从一个小而清晰的判断开始：定义 state，拆出几个原子问题，用 Playground 验证，再通过官方 API 或 Python SDK 接入代码，最后用置信度阈值和人工兜底控制风险。

## 参考资料

本文优先参考以下 TypeSafe AI 官方资料：

- [TypeSafe AI 官方文档：Introduction](https://docs.typesafe.ai/introduction)
- [TypeSafe AI 官方文档：Quick Start](https://docs.typesafe.ai/introduction/quickstart)
- [TypeSafe AI 官方文档：System One](https://docs.typesafe.ai/concepts/system-one)
- [TypeSafe AI 官方文档：State](https://docs.typesafe.ai/concepts/state)
- [TypeSafe AI 官方文档：Confidence](https://docs.typesafe.ai/confidence)
- [TypeSafe AI 官方博客：Introducing System One Models & Jev](https://typesafe.ai/blog/introducing-system-one-models-and-jev)
