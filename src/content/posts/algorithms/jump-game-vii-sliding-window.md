---
title: 1871. 跳跃游戏 VII：用滑动窗口优化可达性 DP
published: 2026-09-19
description: 将每个位置的可达性转化为前一段区间内是否存在可达位置，并用滑动窗口把二次 DP 优化为线性。
tags: [动态规划, 滑动窗口, 字符串]
category: 算法题解
draft: false
---

令 `dp[i]` 表示能否到达位置 `i`。当 `s[i]` 为 `0` 时，若区间 `[i - maxJump, i - minJump]` 中任意位置可达，则 `dp[i]` 为真。

## 暴力 DP

以下是原始的区间枚举版本：

```
class Solution {
public:
    bool canReach(string s, int minJump, int maxJump) {
        int n = s.size();
        vector<int> f(n, 0);

        f[0] = 1;

        for(int i = 0; i < n; i ++ ) {
            if(!f[i]) continue;

            for(int j = i + minJump; j <= min(n - 1, i + maxJump); j ++ ) {
                if(s[j] == '0') f[j] = 1;
            }
        }

        return f[n - 1];
    }
};
```

直接检查整个区间需要 $O(n^2)$。观察到该区间随 `i` 右移，维护窗口内可达位置数 `count` 即可。

## 滑动窗口优化

```
class Solution {
public:
    bool canReach(string s, int minJump, int maxJump) {
        int n = s.size();

        vector<int> f(n, 0);
        f[0] = 1;

        int cnt = 0;
        for(int i = 1; i < n; i ++ ) {

            int r = i - minJump;
            if(r >= 0 && f[r]) cnt ++;

            int l = i - maxJump - 1;
            if(l >= 0 && f[l]) cnt --;

            if(s[i] == '0' && cnt) f[i] = 1;
        }

        return f[n - 1];
    }
};
```

`enter` 是新进入可跳区间的位置，`leave` 是刚离开区间的位置；两者的下标是最容易写错的部分。时间复杂度 $O(n)$，空间复杂度 $O(n)$。
