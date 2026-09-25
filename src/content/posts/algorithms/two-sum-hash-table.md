---
title: 两数之和：哈希表查找补数
published: 2026-09-20
description: 先用哈希表记录数值与下标，再逐个查询目标补数，将两数之和从枚举所有组合优化到线性时间。
tags: [哈希表, 数组]
category: 算法题解
draft: false
---

题目要求在数组中找到两个不同下标，使其元素之和等于 `target`。关键是把“寻找另一个数”转换为“查询补数”。

## 思路

先把每个数值与其下标写入映射；随后遍历数组，查询补数 `target - nums[i]` 是否存在，且其下标不能与当前下标相同。

:::tip[当前代码的处理方式]
这份实现采用“先建表、后查询”的两次遍历；`m[k] != i` 用于排除同一个元素被重复使用的情况。
:::

```cpp
class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        int n = nums.size();

        map<int, int> m;
        vector<int> ans;

        for(int i = 0; i < n; i ++ ) m[nums[i]] = i;

        for(int i = 0; i < n; i ++ ) {
            auto x = nums[i];
            int k = target - x;
            if(m.count(k) && m[k] != i) {
                ans.push_back(i);
                ans.push_back(m[k]);
                break;
            }
        }

        return ans;
    }
};
```

## 复杂度与边界

- 时间复杂度：$O(n)$，每次哈希查询均摊为常数时间。
- 空间复杂度：$O(n)$。
- 数组存在重复元素时仍然有效；题目保证唯一答案时可直接返回。
