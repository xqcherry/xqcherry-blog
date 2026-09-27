---
title: 92. 反转链表 II：头插法与三指针法
published: 2026-09-27
description: 只反转单链表中 left 到 right 的连续区间，保留头插法与三指针法两种原地解法，并比较它们的复杂度与适用场景。
tags: [链表, 双指针]
category: 算法题解
draft: false
---

[LeetCode 92. 反转链表 II](https://leetcode.cn/problems/reverse-linked-list-ii/description/) 要求反转单链表中第 `left` 个节点到第 `right` 个节点之间的部分，其余节点的相对顺序保持不变。

例如，链表 `1 → 2 → 3 → 4 → 5`，当 `left = 2`、`right = 4` 时，结果是 `1 → 4 → 3 → 2 → 5`。

## 统一处理边界：哨兵节点

如果反转区间从头节点开始，反转后头节点会发生变化。创建一个位于头节点之前的哨兵节点，可以把“反转头部”和“反转中间区间”统一起来：

```text
dummy → ... → (left 位置的前一个节点) → [待反转区间] → ...
```

令 `p` 指向反转区间的前一个节点，后续只需要重新连接 `p` 附近的节点即可。最后返回 `dummy->next`。

## 解法一：头插法

头插法固定区间的第一个节点 `cur`，每次把它后面的节点 `nxt` 摘出来，插入到区间最前面。经过一次操作，反转区间就多反转一个节点。

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
    ListNode* reverseBetween(ListNode* head, int left, int right) {
        PtrToNode node = new ListNode();
        node->next = head;
        node->val = 0;

        PtrToNode t = node, p = node;

        for(int i = 0; i < left - 1; i ++ ) p = p->next;

        PtrToNode cur = p->next;
        for(int i = 0; i < right - left; i ++ ) {
            PtrToNode nxt = cur->next;
            cur->next = nxt->next;
            nxt->next = p->next;
            p->next = nxt;
        }

        return t->next;
    }
};
```

这里 `cur` 始终是反转区间的第一个节点。以 `2 → 3 → 4` 为例：先把 `3` 插到 `2` 前面，再把 `4` 插到 `3` 前面，区间就变成 `4 → 3 → 2`。每次只修改相邻节点的连接，不需要额外链表或递归栈。

## 解法二：三指针法

三指针法按照普通链表反转的方式，用 `prev`、`cur`、`nxt` 逐个翻转区间内的节点。区间翻转结束后，再把反转后的两端接回原链表。

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
    ListNode* reverseBetween(ListNode* head, int left, int right) {
        PtrToNode node = new ListNode();
        node->next = head;
        node->val = 0;

        PtrToNode t = node, p = node;
        for(int i = 0; i < left - 1; i ++ ) p = p->next;

        PtrToNode prev = nullptr;
        PtrToNode cur = p->next;
        for(int i = 0; i <= right - left; i ++ ) {
            PtrToNode nxt = cur->next;
            cur->next = prev;
            prev = cur;
            cur = nxt;
        }

        p->next->next = cur;
        p->next = prev;

        return t->next;
    }
};
```

翻转完成后，原来的区间头节点已经变成区间尾节点，所以 `p->next` 仍然指向它。先让它连接到区间后继 `cur`，再让 `p` 连接到新的区间头 `prev`，即可完成整体拼接。

## 复杂度与最优解

两种解法都只扫描反转区间一次，并且只使用常数个指针：

- 时间复杂度：`O(n)`，其中 `n` 是链表长度；定位区间和反转区间合计不会超过线性时间。
- 额外空间复杂度：`O(1)`，不计题目提供的节点和新建的哨兵节点。

从渐进复杂度看，两者都已经是最优：至少需要访问相关节点，时间下界是 `O(n)`；原地调整连接也达到了常数额外空间。

如果更看重代码短小和反转区间时的操作次数，推荐头插法；如果更看重与“整条链表反转”一致的思维方式，三指针法更直观。面试或刷题时，头插法更容易直接复用到“只反转一段连续区间”的场景，三指针法则更适合已经熟悉标准链表反转模板的情况。

