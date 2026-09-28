---
title: "82. 删除排序链表中的重复元素 II：跳过整段重复值"
published: 2026-09-28
description: "在有序单链表中删除所有出现过重复的值，使用哨兵、前驱指针和当前指针一次遍历完成。"
tags: [链表, 双指针]
category: 算法题解
draft: false
---

[LeetCode 82. 删除排序链表中的重复元素 II](https://leetcode.cn/problems/remove-duplicates-from-sorted-list-ii) 要求删除所有出现重复的值。例如 `1 → 2 → 3 → 3 → 4 → 4 → 5` 应变成 `1 → 2 → 5`，重复值本身也不能保留。

## 思路

链表已经有序，所以相同的值一定连续出现。遍历时维护两个指针：

- `pre`：当前已经确认不重复部分的尾节点；
- `cur`：正在检查的连续值区间的起点。

如果 `cur` 与下一个节点值相同，就记录这个重复值，并让 `cur` 一直跳过整段相同节点，最后把 `pre->next` 直接接到 `cur`。如果当前值没有重复，则 `pre` 和 `cur` 一起向后移动。

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
    ListNode* deleteDuplicates(ListNode* head) {
        PtrToNode node = new ListNode();
        node->next = head;

        PtrToNode pre = node, cur = node->next;
        while(cur != nullptr) {
            
            if(cur->next != nullptr && cur->next->val == cur->val) {
                int val = cur->val;
                while(cur != nullptr && cur->val == val) cur = cur->next;
                pre->next = cur;
            }
            else {
                pre = cur;
                cur = cur->next;
            }
        }

        return node->next;
    }
};
```

## 为什么需要哨兵节点

如果重复值出现在链表开头，例如 `1 → 1 → 2`，删除重复段后新的头节点会变成 `2`。让 `pre` 初始指向哨兵节点，就能统一处理“删除头部重复段”和“删除中间重复段”两种情况，最后始终返回 `node->next`。

## 复杂度

- 时间复杂度：`O(L)`，每个节点最多被 `cur` 访问一次。
- 额外空间复杂度：`O(1)`，只使用常数个指针和一个哨兵节点。

这道题与“删除重复元素 I”的区别是：重复值不能保留任何一个节点，因此发现重复后必须整段跳过，而不是只删除多出来的节点。
