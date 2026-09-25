---
title: 76. 最小覆盖子串：滑动窗口的扩张与收缩
published: 2026-09-21
description: 用字符计数维护窗口是否覆盖目标串；窗口满足条件时尽可能收缩，以得到最短合法子串。
tags: [滑动窗口, 字符串, 哈希表]
category: 算法题解
draft: false
---

滑动窗口的核心不是枚举所有区间，而是维护一个不变量：窗口何时已经覆盖 `t`。当前实现用 `nd` 记录目标字符计数、`win` 记录窗口计数，并用 `check()` 判断是否满足覆盖条件；右指针负责扩张，左指针负责删除冗余字符并更新最优答案。

```cpp
#include<bits/stdc++.h>
using namespace std;

map<char, int> nd, win;
string s, t;
string res;

int check() {
    for(auto& [c, cnt] : nd) {
        if(win[c] < cnt) return 0;
    }
    return 1;
}

int main() {

    cin >> s >> t;

    int m = s.size();
    int n = t.size();

    for(auto& c : t) nd[c] ++;

    int l = 0, r = 0;
    int resl = 0, mlen = 1e9;

    while(r < m) {
        win[s[r]] ++;

        while(check()) {

            if(r - l + 1 < mlen) {
                mlen = r - l + 1;
                resl = l;
            }

            win[s[l]] --;
            l ++;
        }

        r ++;
    }

    if(mlen == 1e9) res = "";
    else res = s.substr(resl, mlen);

    cout << res << "\n";

    return 0;
}
```

## 边界

`check()` 会逐一确认 `nd` 中所有字符的需求量，因此能正确处理 `t` 中的重复字符。两个指针都只向右移动；单次检查需要遍历目标字符集合。
