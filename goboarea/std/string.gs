%define ASCII_UPPERCASE "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
%define ASCII_LOWERCASE "abcdefghijklmnopqrstuvwxyz"
%define ASCII_DIGITS "0123456789"
%define HEX_DIGITS "0123456789ABCDEF"

# Return the characters of $text between $start and $end (inclusive).
func slice(text, start, end) {
    local result = "";
    local i = $start;
    repeat 1 + $end - $start {
        result &= $text[i];
        i++;
    }
    return result;
}

# Remove $delete_count characters from $text starting at $start and insert $ins
# between.
func splice(text, start, delete_count, ins) {
    local result = "";
    local i = 1;
    if $start > 0 {
        repeat $start - 1 {
            result &= $text[i];
            i++;
        }
    } else {
        repeat length($text) + $start {
            result &= $text[i];
            i++;
        }
    }
    result &= $ins;
    i += $delete_count;
    until i > length($text) {
        result &= $text[i];
        i++;
    }
    return result;
}

# Transform ASCII letters in $text to uppercase.
func uppercase(text) {
    local result = "";
    local i = 1;
    repeat length($text) {
        local j = 1;
        until $text[i] == ASCII_UPPERCASE[j] or j > 26 {
            j++;
        }
        if j > 26 {
            result &= $text[i];
        } else {
            result &= ASCII_UPPERCASE[j];
        }
        i++;
    }
    return result;
}

# Transform ASCII letters in $text to lowercase.
func lowercase(text) {
    local result = "";
    local i = 1;
    repeat length($text) {
        local j = 1;
        until $text[i] == ASCII_UPPERCASE[j] or j > 26 {
            j++;
        }
        if j > 26 {
            result &= $text[i];
        } else {
            result &= ASCII_LOWERCASE[j];
        }
        i++;
    }
    return result;
}

# Transform the first character in $text to uppercase, and the rest to lowercase.
func capitalize(text) {
    local result = "";
    local i = 1;
    until $text[1] == ASCII_UPPERCASE[i] or i > 26 {
        i++;
    }
    if i > 26 {
        result &= $text[1];
    } else {
        result &= ASCII_UPPERCASE[i];
    }
    i++;
    repeat length($text) - 1 {
        local j = 1;
        until $text[i] == ASCII_LOWERCASE[j] or j > 26 {
            j++;
        }
        if j > 26 {
            result &= $text[i];
        } else {
            result &= ASCII_LOWERCASE[j];
        }
        i++;
    }
    return result;
}

# Conditional macro to check if $text starts with $prefix.
%define ENDSWITH(TEXT,SUFFIX)                                                          \
    (slice((TEXT), 1 + length(TEXT) - length(SUFFIX), length(TEXT)) == (SUFFIX))

# Conditional macro to check if $text starts with $prefix.
%define STARTSWITH(TEXT,PREFIX)                                                        \
    (slice((TEXT), 1, length(PREFIX)) == (PREFIX))

# Remove $prefix from the beginning of $text.
%define REMOVEPREFIX(TEXT,PREFIX) (splice(TEXT, 1, length(PREFIX), ""))

# Remove $suffix from the end of $text.
%define REMOVESUFFIX(TEXT,SUFFIX) (splice(TEXT, -length(SUFFIX), length(SUFFIX), ""))

# Return the index of the first occurrence of $char in $text, or 0 if not found.
func findchar(text, char) {
    local i = 1;
    repeat length($text) {
        if $text[i] == $char {
            return i;
        }
        i++;
    }
    return 0;
}

# Return the index of the last occurrence of $char in $text, or 0 if not found.
func rfindchar(text, char) {
    local i = length($text);
    repeat length($text) {
        if $text[i] == $char {
            return i;
        }
        i--;
    }
    return 0;
}

# Return true if all characters in $text are alphanumeric and there is at least one
# character.
func isalnum(text) {
    if length($text) == 0 {
        return false;
    }
    local i = 1;
    repeat length($text) {
        if $text[i] not in ASCII_UPPERCASE & ASCII_DIGITS {
            return false;
        }
        i++;
    }
    return true;
}

# Return true if all characters in $text are alphabetic and there is at least one
# character.
func isalpha(text) {
    if length($text) == 0 {
        return false;
    }
    local i = 1;
    repeat length($text) {
        if $text[i] not in ASCII_UPPERCASE {
            return false;
        }
        i++;
    }
    return true;
}

# Conditional macro to check if $text is a digit.
%define ISDIGIT(TEXT) (round(TEXT) == (TEXT))

# Remove leading characters in $text that are in $chars.
func lstrip(text, chars) {
    local result = "";
    local i = 1;
    until $text[i] not in $chars or i > length($text) {
        i++;
    }
    until i > length($text) {
        result &= $text[i];
        i++;
    }
    return result;
}

# Remove trailing characters in $text that are in $chars.
func rstrip(text, chars) {
    local i = length($text);
    until $text[i] not in $chars or i == 1 {
        i--;
    }
    local result = "";
    j = 1;
    until j > i {
        result &= $text[j];
        j++;
    }
    return result;
}

# Remove leading and trailing characters in $text that are in $chars.
%define STRIP(text,chars) lstrip(rstrip(text, chars), chars)

list split;

# Split $text into a list of strings, separated by $sep, which is 1 char. Result is stored in list
# `split`.
proc split text, sep {
    delete split;
    local part = "";
    local i = 1;
    repeat length($text) {
        if $text[i] == $sep {
            add part to split;
            part = "";
        } else {
            part &= $text[i];
        }
        i++;
    }
    add part to split;
}

# Split $text into a list of strings, seperated by $sep, which is also a string. Not case sensitive. Result is stored in list
# `split`
proc split_by_str text, sep {
    delete split;
    local i = 1;

    until i > length $text {
        local part = "";
        local hit_splitter = false;

        until hit_splitter or i > length $text {
            hit_splitter = _string_compute_hit(i, $text, $sep);

            local letter = $text[i];
            if not hit_splitter {
                part &= letter;
            }

            i++;
        }

        i += length $sep - 1;
        add part to split;
    }
}

func _string_compute_hit(i, text, sep) {
    if $text[$i] == $sep[1] {
        local future = "";
        local i = $i;
        repeat length $sep {
            future &= $text[i];
            i++;
        }
        return future == $sep;

    } else {
        return false;
    }
}

# Not really sure why this doesn't work
# %define SPLIT_BY_LIST(text,sep_list)                                        \
#     delete split;                                                           \
#     local i = 1;                                                            \
#     until i > length text {                                                 \
#         local part = "";                                                    \
#         local hit_splitter = false;                                         \
#                                                                             \
#         until hit_splitter or i > length text {                             \
#             local k = 1;                                                    \
#             until hit_splitter or k >= length sep_list {                    \
#                 local splitter = sep_list[k];                               \
#                 hit_splitter = _string_compute_hit(i, text, splitter);      \
#                 k++;                                                        \
#             }                                                               \ 
#                                                                             \
#             local letter = text[i];                                         \
#             if not hit_splitter {                                           \
#                 part &= letter;                                             \
#                 splitter = "";                                              \
#             }                                                               \
#             i++;                                                            \
#         }                                                                   \
#         i += length splitter - 1;                                           \
#         add part to split;                                                  \
#     }                                                                       \

# Return a titlecased version of $text: words start with uppercase characters,
# all remaining cased characters are lowercase.
func titlecase(text) {
    local result = "";
    local i = 1;
    local boundary = false;
    repeat length($text) {
        local j = 1;
        until $text[i] == ASCII_UPPERCASE[j] or j > 26 {
            j++;
        }
        if j > 26 {
            boundary = false;
            result &= $text[i];
        } else {
            if boundary == false {
                boundary = true;
                result &= ASCII_UPPERCASE[j];
            } else {
                result &= ASCII_LOWERCASE[j];
            }
        }
        i++;
    }
    return result;
}

# Reverse $text.
func reverse(text) {
    local result = "";
    local i = 1;
    repeat length($text) {
        result = $text[i] & result;
        i++;
    }
    return result;
}

# Replace all occurrences of $replaced in $text with $replacement.
func replace(text, replaced, replacement) {
    local result = "";
    local i = 1;
    repeat length($text) {
        local j = 0;
        local replace = true;
        repeat length($replaced) {
            if $text[i + j] != $replaced[j + 1] {
                replace = false;
            }
            j++;
        }
        if replace == true {
            i += length($replaced) - 1;
            result &= $replacement;
        } else {
            result &= $text[i];
        }
        i++;
    }
    return result;
}

# Repeat $text $count times.
func repeatstr(text, count) {
    local result = "";
    local i = 1;
    repeat $count {
        result &= $text;
        i++;
    }
    return result;
}

# Join `LIST` elements into a string, separated by `SEP` and store the result in `STORE`.
%define JOIN(LIST,SEP,STORE)                                                           \
    local STORE = "";                                                                  \
    local i = 1;                                                                       \
    repeat length(LIST) {                                                              \
        STORE &= LIST[i];                                                              \
        if i < length(LIST) {                                                          \
            STORE &= SEP;                                                              \
        }                                                                              \
        i++;                                                                           \
    }

# Fill a string with zeroes to the left so that is the specified length.
func zfill(s, zeroes) {
    local ret = $s;
    repeat $zeroes - length $s {
        ret = 0 & ret;
    }
    return ret;
}

func startswith(text, start) {
    local i = 1;
    repeat length $start {
        if $text[i] != $start[i] {
            return false;
        }
    }
    return true;
}
func startswith_from_idx(text, start, i) {
    local i = $i;
    repeat length $start {
        if $text[i] != $start[i] {
            return false;
        }
    }
    return true;
}