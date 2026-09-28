---
title: "61. 旋转链表：定位断点后重新连接"
published: 2026-09-28
description: "先计算链表长度并将旋转次数对长度取模，再找到新的尾节点，断开并重新连接链表。"
tags: [链表, 快慢指针]
category: 算法题解
draft: false
---

[LeetCode 61. 旋转链表](https://leetcode.cn/problems/rotate-list/) 要求将链表每个节点向右移动 `k` 个位置。比如 `1 → 2 → 3 → 4 → 5` 向右旋转 `2` 次后得到 `4 → 5 → 1 → 2 → 3`。

## 思路

向右旋转 `k` 次，本质上是把链表最后 `k` 个节点移到最前面。设链表长度为 `len`：

1. 先遍历链表得到 `len`。
2. 令 `k %= len`，因为旋转 `len` 次会回到原状。
3. 新头节点位于原链表的第 `len - k + 1` 个位置，新的尾节点位于它前面。
4. 从头节点出发找到新的尾节点 `pre`，令 `n_head = pre->next`。
5. 断开 `pre->next`，再把原尾节点连接到旧头节点，返回 `n_head`。

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
    ListNode* rotateRight(ListNode* head, int k) {

        if(head == nullptr) return head;
        
        int len = 0;
        PtrToNode cur = head;
        while(cur != nullptr) {
            cur = cur->next;
            len ++;
        }

        k %= len;
        if(k == 0) return head;

        PtrToNode pre = head;
        for(int i = 1; i < len - k; i ++ ) pre = pre->next;

        PtrToNode n_head = pre->next;
        pre->next = nullptr;

        cur = n_head;
        while(cur->next != nullptr) cur = cur->next;
        cur->next = head;

        return n_head;
    }
};
```

## 断点为什么在 `len - k`

以长度为 `5`、`k = 2` 为例，最后两个节点 `4 → 5` 会移动到头部，因此新的头是第 `4` 个节点，新的尾是第 `3` 个节点。代码中的循环让 `pre` 从第 `1` 个节点走到第 `len - k` 个节点，也就是新的尾节点。

## 边界条件与复杂度

- 空链表直接返回。
- `k` 是 `0` 或 `k` 是 `len` 的倍数时，链表不变，直接返回原头节点。
- 时间复杂度：`O(L)`，其中 `L` 是链表长度；当前实现先求长度，再查找断点并寻找新尾节点，仍是线性时间。
- 额外空间复杂度：`O(1)`。

也可以先把链表首尾相连形成环，再从新的断点处断开；那种写法同样是 `O(L)` 时间和 `O(1)` 空间，而当前写法更直接地展示了“移动后缀”的过程。
