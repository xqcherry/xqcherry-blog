---
title: 138. 复制带随机指针的链表：用哈希表建立新旧节点映射
published: 2026-09-29
description: 先复制所有链表节点，再根据新旧节点映射恢复 next 和 random 指针，处理随机指针为空或指向任意节点的情况。
tags: [链表, 哈希表, 深度复制]
category: 算法题解
draft: false
---

链表中的每个节点除了 `next` 指针外，还包含一个 `random` 指针。`random` 可以指向链表中的任意节点，也可以为空。题目要求创建一份完全独立的深拷贝：新链表中的节点值相同，但所有指针都必须指向新节点，不能引用原链表。

## 思路：分两次遍历

关键是维护一张“旧节点 $→$ 新节点”的映射表 `m`，并将复制过程拆成两个阶段：

1. 第一次遍历只复制节点本身，将每个旧节点和对应的新节点写入 `m`。
2. 第二次遍历根据映射表设置新节点的 `next` 和 `random` 指针。

这样，即使 `random` 指向后面的节点，也可以直接通过映射表找到对应的新节点；如果指针为空，`map` 对应的值也为空，不会把原节点带入深拷贝。

:::tip[为什么不能只复制 next]
如果在创建节点时直接复制 `random`，得到的指针仍然属于原链表。必须先保证所有新节点都已经创建，再统一连接指针。
:::

```cpp
/*
// Definition for a Node.
class Node {
public:
    int val;
    Node* next;
    Node* random;

    Node(int _val) {
        val = _val;
        next = NULL;
        random = NULL;
    }
};
*/

class Solution {
public:
    typedef struct Node* PtrToNode;
    Node* copyRandomList(Node* head) {
        if(head == NULL) return NULL;

        map<PtrToNode, PtrToNode> m;

        PtrToNode cur = head;
        while(cur != NULL) {
            m[cur] = new Node(cur->val);
            cur = cur->next;
        }

        cur = head;
        while(cur != NULL) {
            m[cur]->next = m[cur->next];
            m[cur]->random = m[cur->random];

            cur = cur->next;
        }

        return m[head];
    }
};
```

## 复杂度与边界

- 时间复杂度：$O(n)$，两次遍历链表，映射查询的复杂度取决于 `map` 的实现。
- 空间复杂度：$O(n)$，映射表保存每个旧节点对应的新节点。
- 空链表直接返回 `NULL`。
- `random` 为空时，`m[cur->random]` 对应空指针；`random` 指向自身或其他任意节点时，都能通过映射表正确连接。

题目链接：[复制带随机指针的链表](https://leetcode.cn/problems/copy-list-with-random-pointer)
