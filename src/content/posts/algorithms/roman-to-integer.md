---
title: 罗马数字转整数：识别特殊减法对
published: 2026-09-20
description: 将基础符号和六种特殊减法组合分别映射为数值，通过线性扫描完成转换。
tags: [字符串, 哈希表]
category: 算法题解
draft: false
---

罗马数字通常从左到右累加；`IV`、`IX`、`XL`、`XC`、`CD`、`CM` 是需要整体处理的减法组合。代码用一个单字符映射和一个双字符映射分别处理它们。

```cpp
class Solution {
public:
    int romanToInt(string s) {
        map<char, int> m = {
            {'I', 1}, {'V', 5}, {'X', 10}, {'L', 50},
            {'C', 100}, {'D', 500}, {'M', 1000}
        };

        map<string, int> n = {
            {"IV", 4}, {"IX", 9},
            {"XL", 40}, {"XC", 90},
            {"CD", 400}, {"CM", 900}
        };

        int res = 0;

        for(int i = 0; i < s.size(); i ++ ) {
            if(i + 1 < s.size()) {
                string t = s.substr(i, 2);
                if(n.count(t)) {
                    res += n[t];
                    i ++;
                    continue;
                }
            }
            res += m[s[i]];
        }

        return res;
    }
};
```

## 复杂度

- 时间复杂度：$O(n)$。
- 空间复杂度：$O(1)$；符号映射大小固定。

:::note[判断条件]
不必逐一枚举 `IV`、`IX` 等减法组合。比较当前字符与下一个字符，就能统一覆盖全部合法减法对。
:::
