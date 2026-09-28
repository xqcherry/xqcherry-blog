---
title: "19. 删除链表的倒数第 N 个结点：哨兵与快慢指针"
published: 2026-09-28
description: "使用哨兵节点统一处理删除头结点的情况，再用快慢指针定位倒数第 N 个结点的前驱。"
tags: [链表, 双指针]
category: 算法题解
draft: false
---

[LeetCode 19. 删除链表的倒数第 N 个结点](https://leetcode.cn/problems/remove-nth-node-from-end-of-list/description/) 要求删除单链表中倒数第 `n` 个节点，并返回删除后的头节点。

## 思路

这道题的关键是找到待删除节点的前一个节点。可以让两个指针从同一个位置出发，并先让快指针 `r` 向前走 `n` 步：

1. 创建一个位于原链表头之前的哨兵节点 `node`，这样即使删除的是原头节点，也不需要额外特判。
2. 让 `l` 和 `r` 都指向哨兵节点。
3. 让 `r` 先走 `n` 步，随后两个指针同步向后移动。
4. 当 `r` 到达尾节点时，`l` 正好位于待删除节点的前一个位置。
5. 跳过 `l->next`，最后返回 `node->next`。

```cpp
class Solution {
public:
    typedef struct ListNode* PtrToNode;

    ListNode* removeNthFromEnd(ListNode* head, int n) {
        PtrToNode node = new ListNode();
        node->next = head;

        PtrToNode l = node, r = node;
        for(int i = 0; i < n; i++) r = r->next;

        while(r->next != nullptr) {
            l = l->next;
            r = r->next;
        }

        l->next = l->next->next;

        return node->next;
    }
};
```

## 为什么快慢指针能定位前驱

快指针先领先 `n` 个节点。之后两个指针每次同时前进一个节点，因此快指针到达尾节点时，慢指针与待删除节点之间恰好还差一个节点。`while (r->next != nullptr)` 让 `r` 停在尾节点，而不是越过链表，正好保证 `l` 停在待删除节点的前驱位置。

哨兵节点尤其重要：当 `n` 等于链表长度时，`l` 最终仍然停在哨兵节点上，`l->next = l->next->next` 就能直接删除原头节点。

## 复杂度

- 时间复杂度：`O(L)`，其中 `L` 是链表长度；快指针和慢指针至多各走一遍链表。
- 额外空间复杂度：`O(1)`，只使用常数个指针和一个哨兵节点。

代码中的哨兵节点通过 `new` 创建，若在完整程序中长期运行，应在不再需要时释放它，或改用栈上的哨兵对象。
