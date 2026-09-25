---
title: 反转链表：三指针迭代
published: 2026-09-25
description: 用 pre、node、p 三个指针逐个改写 next 指向，一趟迭代完成单链表反转。
tags: [链表, 双指针]
category: 算法题解
draft: false
---

[LeetCode 206. 反转链表](https://leetcode.cn/problems/reverse-linked-list/)：把单链表整体反转，返回新的表头。核心是只改指针方向、不移动节点。

## 思路

维护两个指针：`node` 指向当前待处理的节点，`pre` 指向已反转部分的头。每一步做三件事：

1. 暂存后继 `p = node->next`，防止断链后找不到剩余部分；
2. 把 `node->next` 反过来指向 `pre`，当前节点完成反转；
3. `pre` 和 `node` 各前进一步，进入下一轮。

循环结束时 `node` 为空，`pre` 恰好停在原链表的尾节点，也就是新链表的头。

:::tip[为什么需要第三个指针]
如果不先保存 `node->next` 就改写指针，剩余链表会立即失联，后续节点再也访问不到。
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
    ListNode* reverseList(ListNode* head) {
        PtrToNode node = head, pre = nullptr;

        while(node != nullptr) {
            PtrToNode p = node->next;
            node->next = pre;
            pre = node;
            node = p;
        }

        return pre;
    }
};
```

## 复杂度

- 时间复杂度：$O(n)$，每个节点恰好被访问一次。
- 空间复杂度：$O(1)$，只用了常数个指针。
- 空链表和单节点链表都能直接处理：循环不执行，返回 `pre = nullptr` 或原头节点。
