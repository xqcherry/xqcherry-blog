---
title: 11. 盛最多水的容器：双指针如何排除无效区间
published: 2026-09-29
description: 从数组两端开始枚举容器，利用较短边决定移动方向，在一次线性扫描中找到最大面积。
tags: [双指针, 数组, 贪心]
category: 算法题解
draft: false
---

给定一个非负整数数组 `height`，第 `i` 个元素表示一条竖线的高度。任意选择两条竖线，它们与横轴组成一个容器，要求返回容器能够盛放的最大水量。

容器面积由两部分决定：两条线之间的距离，以及两条线中较短的高度：

$$
area = (r - l) \times \min(height[l], height[r])
$$

## 思路：从两端向内收缩

令左指针 `l` 指向最左端，右指针 `r` 指向最右端。此时宽度最大，先计算当前区间的面积。

接下来必须移动较短的一侧：

- 如果 `height[l] < height[r]`，移动 `l`；
- 否则移动 `r`。

原因是，当前面积受较短边限制。移动较长边只会让宽度变小，而新的短边不可能超过原来的短边，因此不可能得到更大的面积；只有尝试移动短边，才有机会遇到更高的边来弥补宽度的损失。

:::tip[双指针的不变量]
每次移动都排除了当前短边参与的、宽度更小的所有区间，因此不会漏掉最优答案。
:::

```cpp
class Solution {
public:
    int maxArea(vector<int>& height) {
        int n = height.size();
        int res = 0;

        int l = 0, r = n - 1;
        while(l < r) {
            int z = (r - l) * min(height[l], height[r]);
            res = max(res, z);

            if(height[l] < height[r]) l ++;
            else r --;
        }

        return res;
    }
};
```

## 复杂度

- 时间复杂度：$O(n)$，左右指针总共移动不超过 `n - 1` 次。
- 空间复杂度：$O(1)$，只使用常数个辅助变量。

题目链接：[盛最多水的容器](https://leetcode.cn/problems/container-with-most-water)
