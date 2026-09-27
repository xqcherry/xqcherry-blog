---
title: 25. K 个一组翻转链表：三指针与头插法
published: 2026-09-27
description: 将链表按 K 个节点分组并原地翻转，保留三指针法与头插法两种实现，比较它们的边界处理、复杂度和推荐场景。
tags: [链表, 模拟]
category: 算法题解
draft: false
---

[LeetCode 25. K 个一组翻转链表](https://leetcode.cn/problems/reverse-nodes-in-k-group/description/) 要求将链表按连续的 `k` 个节点分组并翻转；如果最后剩余节点不足 `k` 个，则保持原顺序。

例如，链表为 `1 → 2 → 3 → 4 → 5`、`k = 2` 时，结果是 `2 → 1 → 4 → 3 → 5`。

## 核心框架：先确认，再翻转

每轮从 `p->next` 开始处理一组节点，并让 `end` 向后走 `k` 步：

1. 如果中途遇到空指针，说明剩余节点不足 `k` 个，直接返回，不能翻转这一组。
2. 如果成功找到第 `k` 个节点，就翻转这组节点。
3. 翻转完成后，原来的组头会变成组尾；让 `p` 移动到这个组尾，继续处理下一组。

哨兵节点 `node` 放在原链表头之前，可以统一处理第一组翻转后头节点变化的情况。

## 解法一：三指针法

三指针法先把当前这一组从原链表中截断，再调用普通的 `reverseList` 翻转，最后把翻转后的链表重新接回去。

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

    PtrToNode reverseList(PtrToNode head) {
        
        PtrToNode prev = nullptr, cur = head;
        while(cur != nullptr) {
            PtrToNode nxt = cur->next;
            cur->next = prev;
            prev = cur;
            cur = nxt;
        }

        return prev;
    }

    ListNode* reverseKGroup(ListNode* head, int k) {
        
        PtrToNode node = new ListNode();
        node->next = head;

        PtrToNode p = node;
        while(1) {
            PtrToNode cur = p->next;
            PtrToNode end = p;
            for(int i = 0; i < k; i ++ ) {
                end = end->next;
                if(end == nullptr) return node->next;
            }

            PtrToNode nxt = end->next;
            end->next = nullptr;

            p->next = reverseList(cur);
            cur->next = nxt;

            p = cur;
        }
    }
};
```

截断操作让 `reverseList` 只处理当前这一组，避免把后续节点误翻转。翻转后，`cur` 已经成为这一组的尾节点，因此它正好是下一轮的前驱节点。

## 解法二：头插法

头插法不需要截断链表。固定当前分组的第一个节点 `cur`，重复把它后面的节点移动到 `p` 后面，经过 `k - 1` 次操作即可完成一组翻转。

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
    ListNode* reverseKGroup(ListNode* head, int k) {
        
        PtrToNode node = new ListNode();
        node->next = head;

        PtrToNode p = node;
        while(1) {
            PtrToNode cur = p->next;
            PtrToNode end = p;
            for(int i = 0; i < k; i ++ ) {
                end = end->next;
                if(end == nullptr) return node->next;
            }

            for(int i = 0; i < k - 1; i ++ ) {
                PtrToNode nxt = cur->next;
                cur->next = nxt->next;
                nxt->next = p->next;
                p->next = nxt;
            }

            p = cur;
        }
    }
};
```

例如当前分组是 `1 → 2 → 3`，`p` 指向 `1` 的前驱：先把 `2` 插到 `p` 后面，再把 `3` 插到 `p` 后面，结果就是 `3 → 2 → 1`。由于每次移动的都是 `cur` 后继节点，分组之后的节点连接始终被保留。

## 复杂度与最优解

设链表长度为 `n`：

- 两种解法都需要检查每个节点是否属于完整分组，并且每个节点只参与有限次连接调整，时间复杂度都是 `O(n)`。
- 两种解法都只使用哨兵节点和若干指针，额外空间复杂度都是 `O(1)`。
- 当 `n` 不是 `k` 的整数倍时，最后不足 `k` 个节点的部分不会被修改。

两种方案在渐进意义上同样最优：时间达到 `O(n)`，额外空间达到 `O(1)`。实际写题时更推荐头插法，因为它不需要先断开当前分组，也不需要额外的 `reverseList` 辅助函数，重新连接的步骤更少；三指针法则把“分组”和“普通链表反转”拆开，结构清晰，便于复用已经写好的反转模板。

