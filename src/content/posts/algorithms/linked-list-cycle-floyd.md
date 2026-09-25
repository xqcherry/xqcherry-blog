---
title: 141. 环形链表：哈希集合判圈
published: 2026-09-23
description: 记录已经访问过的节点；再次遇到同一节点时，说明链表存在环。
tags: [链表, 哈希表]
category: 算法题解
draft: false
---

遍历链表时，把每个访问过的节点地址加入集合。若当前节点已存在于集合中，说明沿 `next` 指针回到了此前位置，链表存在环。

```cpp
/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode(int x) : val(x), next(NULL) {}
 * };
 */
class Solution {
public:
    typedef struct ListNode* PtrtoNode;
    bool hasCycle(ListNode *head) {
        
        set<PtrtoNode> s;

        while(head != NULL) {
            if(s.count(head)) return 1;
            s.insert(head);
            head = head->next;
        }

        return 0;
    }
};
```

没有环时会遍历到 `nullptr`；有环时会再次访问某个节点。时间复杂度为 $O(n)$，额外空间为 $O(n)$。
