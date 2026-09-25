---
title: 三数之和：排序加双指针去重
published: 2026-09-20
description: 固定第一个数后，用相向双指针寻找剩余两数，并在三个层次处理重复值。
tags: [双指针, 数组]
category: 算法题解
draft: false
---

目标是在数组中找到所有和为 `0` 且不重复的三元组。暴力枚举需要 $O(n^3)$；排序后固定一个数，可将后两数搜索降为线性。

## 思路

排序后枚举 `i`。在区间 `[i + 1, n - 1]` 中维护 `left`、`right`：和太小就右移 `left`，和太大就左移 `right`，恰好为零时记录答案并跳过重复值。

```cpp
class Solution {
public:
    vector<vector<int>> threeSum(vector<int>& nums) {
        int n = nums.size();
        vector<vector<int>> res;

        if(n == 3) {
            int x = nums[0] + nums[1] + nums[2];
            if(!x) {
                res.push_back(nums);
                return res;
            }
            else {};
        }

        sort(nums.begin(), nums.end());
        for(int i = 0; i < n - 2; i ++ ) {
            if(i > 0 && nums[i] == nums[i - 1]) continue;
            int x = -nums[i];

            int l = i + 1, r = n - 1;
            while(l < r) {
                int t = nums[l] + nums[r];

                if(t == x) {
                    res.push_back({-x, nums[l], nums[r]});
                    while(l < r && nums[l] == nums[l + 1]) l ++;
                    while(l < r && nums[r] == nums[r - 1]) r --;
                    l ++, r --;
                } 
                else if(t > x) r --;
                else l ++;
            }
        }

        return res;
    }
};
```

## 易错点

去重不只发生在 `i`：找到答案后，左右指针也必须越过相同元素，否则会重复收集同一三元组。时间复杂度为 $O(n^2)$，排序以外只使用常数额外空间。
