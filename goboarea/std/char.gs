# Char utilites
# Mainly for unicode

# https://scratch.mit.edu/projects/950639531/
# Translate is not yet supported
# Make a web request to the translate server to fetch a character by unicode index
# func req_chr(idx) {
#     if 13312 < $i and $i < 40959{
#         return translate "Japanese", "&#" & $idx & ";";
#     } else {
#         return translate "Chinese (Simplified)", "&#" & $idx & ";";
#     }
# }

# https://scratch.mit.edu/projects/616351443/ for pre-generated list. Python was giving errors when trying to print certain chars
list unicode = file ```std\\_unicode.txt```;
# NOTE: This list causes much longer compile times

costumes "std\\assets\\blank.svg" as "_char//0";
costumes "std\\assets\\blank.svg" as "_char//abcdefghijklmnopqrstuvwxyz";

func _char_inner_ord(char, low, high) {
    # The item #(str) of (list) block is a pretty slow block and ideally 
    # you wouldn't use it with large lists (it's a linear search)

    # But in this case, you can actually just binary sort for a unicode character lol
    local low = $low;
    local high = $high;

    forever{
        local mid = (low + high) // 2;
        if $char > unicode[mid] {
            low = mid;
        } elif $char < unicode[mid] {
            high = mid + 1;
        } else {
            return mid;
        }
    }
}

# Return the unicode index of char
# Only works with single chars
func ord(char) {
    if length $char == 1 {
        if $char in "abcdefghijklmnopqrstuvwxyz" {
            local chr_idx = "";

            local cos_name = "_char//";
            i = 1;
            repeat 26 {
                if $char == "abcdefghijklmnopqrstuvwxyz"[i] {
                    chr_idx = i;
                    cos_name &= $char;
                } else {
                    cos_name &= "abcdefghijklmnopqrstuvwxyz"[i];
                }
                i++;
            }

            local old_cos = costume_number();
            switch_costume "_char//0";
            switch_costume cos_name;
            local islower = costume_name() == "_char//abcdefghijklmnopqrstuvwxyz";

            switch_costume old_cos;
            return chr_idx + 65 + 32 * islower;

        } elif $char == 0 { 
            # 0 is a special case because it is considered equal to the tab character
            # I'm not sure if there are other cases where this occurs
            if $char in "0"{
                return 48;
            } else {
                return 9; # It's a tab
            }
            
        } else {
            return _char_inner_ord($char, 1, length unicode);
        }
    }
}

%define chr(i) unicode[i]

func islower(char) {
    if $char in "abcdefghijklmnopqrstuvwxyz" {
        local cos_name = "_char//";

        i = 1;
        repeat 26 {
            if $char == "abcdefghijklmnopqrstuvwxyz"[i] {
                chr_idx = i;
                cos_name &= $char;
            } else {
                cos_name &= "abcdefghijklmnopqrstuvwxyz"[i];
            }
            i++;
        }

        local old_cos = costume_number();

        switch_costume "_char//0";
        switch_costume cos_name;
        local islower = costume_name() == "_char//abcdefghijklmnopqrstuvwxyz";

        switch_costume old_cos;
        return islower;

    } else {
            # Not a letter; not applicable
            return false;
    }
}

func isupper(char) {
    if $char in "abcdefghijklmnopqrstuvwxyz" {
        local cos_name = "_char//";

        i = 1;
        repeat 26 {
            if $char == "abcdefghijklmnopqrstuvwxyz"[i] {
                chr_idx = i;
                cos_name &= $char;
            } else {
                cos_name &= "abcdefghijklmnopqrstuvwxyz"[i];
            }
            i++;
        }

        local old_cos = costume_number();

        switch_costume "_char//0";
        switch_costume cos_name;
        local isupper = costume_name() != "_char//abcdefghijklmnopqrstuvwxyz";

        switch_costume old_cos;
        return isupper;

    } else {
            # Not a letter; not applicable
            return false;
    }
}

func lower(char) {
    if $char in "abcdefghijklmnopqrstuvwxyz" {
        return chr(32 + ($char in unicode)); # In this case, as we are dealing with a-z, this is simpler and possibly faster
    } else {
        return $char;
    }
}

func upper(char) {
    if $char in "abcdefghijklmnopqrstuvwxyz" {
        return chr($char in unicode); # In this case, as we are dealing with a-z, this is simpler and possibly faster
    } else {
        return $char;
    }
}

func check(c1, c2) {
    if $c1 == $c2 {
        if $c1 in "\t0abcdefghijklmnopqrstuvwxyz" { # include 0 & \t as well to consider tabs
            return ord($c1) == ord($c2);
        } else {
            return true;
        }
    } else {
        return false;
    }
}
