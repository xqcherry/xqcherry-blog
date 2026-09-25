---
title: 两数相加：递归模拟进位
published: 2026-09-25
description: 两条链表按位逆序存数，用递归逐位相加并把进位作为参数向下传，天然对齐两数长度。
tags: [链表, 递归]
category: 算法题解
draft: false
---

[LeetCode 2. 两数相加](https://leetcode.cn/problems/add-two-numbers/)：两个非负数分别按逆序存在链表里，逐位相加得到同样逆序的结果链表。

## 思路

低位在链表头部，而加法恰好从低位算起，所以顺着链表逐位处理就是模拟竖式加法。用递归把每一位作为一个子问题：

- 参数 `d` 是低位传上来的进位（0 或 1）；
- 递归终止条件：两条链表都空且 `d == 0`，说明没有更高位了，返回空指针；
- 任一链表先走完就取 0 补位（`l1 ? l1->val : 0`），相当于短数前面补零；
- 当前位的和 `s = a + b + d`，新节点存 `s % 10`，进位 `s / 10` 随递归传给下一位。

:::tip[递归的优雅之处]
“较短的数补零”和“最后一位可能多出一个进位节点”这两个边界，都被统一进同一段代码：只要 `l1`、`l2`、`d` 不全为零就继续建节点。
:::

```cpp
/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode() : val(0), next(nullptr) {}
 *     ListNode(int x) : val(x), next(nullptr) {}
 *     ListNode(int x, ListNode *next) : val(x), next(next) {}
 * };
 */
class Solution {
public:
    typedef struct ListNode* PtrToNode;
    ListNode* addTwoNumbers(ListNode* l1, ListNode* l2, int d = 0) {

        if(!l1 && !l2 && d == 0) return nullptr;
        int a = l1 ? l1->val : 0;
        int b = l2 ? l2->val : 0;
        int s = a + b + d;

        PtrToNode node = new ListNode(s % 10);
        node->next = addTwoNumbers(l1 ? l1->next : nullptr,
                                    l2 ? l2->next : nullptr, s / 10);

        return node;
    }
};
```

## 复杂度

- 时间复杂度：$O(\max(m, n))$，每一位处理一次。
- 空间复杂度：不计结果链表为 $O(\max(m, n))$ 的递归栈深度；题目保证链表长度不超过 100，不会栈溢出。
- 最高位再进位（如 `5 + 5 = 10`）时，终止条件里的 `d == 0` 保证会多建一个值为 1 的节点。

## 迭代写法

同样的逻辑也可以用循环加 `carry` 变量实现，避免递归开销；两种写法的位处理逻辑完全一致，按习惯选择即可。
