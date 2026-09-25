---
title: 合并两个有序链表：哑结点尾插
published: 2026-09-25
description: 借助哑结点统一头结点处理，逐个比较两条有序链表的值并尾插，一趟遍历完成合并。
tags: [链表, 双指针]
category: 算法题解
draft: false
---

[LeetCode 21. 合并两个有序链表](https://leetcode.cn/problems/merge-two-sorted-lists/)：把两条升序链表合并成一条升序链表。经典做法是哑结点（dummy node）加双指针尾插。

## 思路

两条链表都是有序的，所以每次只需比较两个表头，取较小者接到结果链尾部：

1. 新建一个哑结点 `node`，它不存有效数据，作用是让“接第一个节点”和“接后续节点”走同一套逻辑，省掉对结果头结点的特判；
2. `p` 记住哑结点位置，`node` 在结果链上始终指向尾节点；
3. `list1`、`list2` 都非空时，较小者接到 `node->next`，对应链表前进一格，`node` 也前进一格；
4. 循环结束后至多剩一条非空链表，其节点已经有序，整条接上 `node->next` 即可；
5. 真正的头是 `p->next`。

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
    ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {

        PtrToNode node = new ListNode();
        node->val = 0;
        node->next = nullptr;
        PtrToNode p = node;


        while(list1 && list2) {
            if(list1->val < list2->val) {
                node->next = list1;
                list1 = list1->next;
            }
            else {
                node->next = list2;
                list2 = list2->next;
            }
            node = node->next;
        }

        node->next = list1 ? list1 : list2;

        return p->next;
    }
};
```

## 复杂度

- 时间复杂度：$O(m + n)$，两个链表的节点各被访问一次。
- 空间复杂度：$O(1)$，只重新分配了一个哑结点，其余节点全部复用。
- 某条链表为空时循环直接跳过，结果就是另一条链表，无需特判。

## 备注

这里的比较用的是 `<`，值相等时取 `list2`，两种取法都保持结果有序，不影响正确性。哑结点本身未释放，若在意可改为栈上对象或循环结束后 `delete`。
