---
title: 42. 接雨水：双指针维护两侧最高柱
published: 2026-09-20
description: 从两侧向中间收缩，利用较低一侧的最高柱确定当前位置的积水量，在线性时间内求解接雨水。
tags: [双指针, 数组]
category: 算法题解
draft: false
---

第 `i` 个位置能接的雨水由左右最高柱中较低的一侧决定：$\max(0, \min(L_i, R_i) - h_i)$。预处理两组最高值可解题，但会消耗 $O(n)$ 空间。

## 双指针不变量

使用 `left`、`right` 从两端收缩，分别维护 `leftMax` 和 `rightMax`。若 `leftMax <= rightMax`，当前位置左侧的上界已经确定，右侧必然至少有 `rightMax`，所以可以立即结算 `left`；反之处理 `right`。

```cpp
class Solution {
public:
    int trap(vector<int>& height) {
        int n = height.size();

        int l = 0, r = n - 1;
        int lmax = 0, rmax = 0;

        int res = 0;

        while(l < r) {
            lmax = max(lmax, height[l]);
            rmax = max(rmax, height[r]);

            if(lmax < rmax) {
                res += lmax - height[l];
                l ++;
            }
            else {
                res += rmax - height[r];
                r --;
            }
        }

        return res;
    }
};
```

时间复杂度为 $O(n)$，额外空间为 $O(1)$。空数组或只有一个柱子时循环不会执行，答案自然为零。
