# JSON support based on the specification at https://json.org/
%include std\\string.gs

# Return 0 if there is an error
func read_whitespace(i, text) {
    local i = $i;
    repeat length $text - $i {
        i++;
        if $text[i] not in " \t" {
            return i - 1;
        }
    }
    return i;
}

func read_number(i, text) {
    local i = $i;
    local ret = "";

    if $text[i] == "-" {
        ret &= "-";
        i++;
    }

    # Either 0, or digit 1-9, then any digit
    if $text[i] == "0" {
        ret &= "0";
        i++;

    } elif $text[i] in "123456789" {
        ret &= $text[i];
        i++;
        until $text[i] not in ASCII_DIGITS or i >= length $text {
            if $text[i] in ASCII_DIGITS {
                ret &= $text[i];
            }
            i++;
        }

    } else {
        # Error
    }

    # Fraction
    if $text[i] == "." {
        i++;
        if $text[i] not in ASCII_DIGITS {
            # error
        }
        until $text[i] not in ASCII_DIGITS or i >= length $text{
            if $text[i] in ASCII_DIGITS {
                ret &= $text[i];
            }
            i++;
        }
    }

    # Exponent
    if $text[i] == "e" { # Scratch is not case sensitive, so this is ok
        i++;
        # Either +, -, or nothing
        if $text[i] == "-" {
            ret &= "-";
            i++;
        } elif $text[i] == "+" {
            i++;
        }

        if $text[i] not in ASCII_DIGITS {
            # error
        }

        until $text[i] not in ASCII_DIGITS or i >= length $text {
            if $text[i] in ASCII_DIGITS{
                ret &= $text[i];
            }
            i++;
        }
    }

    # return ret

    return i;
}

func read_string(i, text) {
    local i = $i;

    if $text[i] != "\"" {
        # error
    }

    i++;
    ret = "";

    if $text[i] == "\"" {
        i++;
        # Empty string

    } else {
        until i >= length $text {
            if $text[i] == "\\" {
                # Escape chars
                i++;

                if $text[i] == "\"" {
                    ret &= "\"";
                    i++;

                } elif $text[i] == "\\" {
                    ret &= "\\";
                    i++;

                } elif $text[i] == "/" {
                    ret &= "/";
                    i++;

                } elif $text[i] == "b" {
                    # Backspace; not really sure how to implement this
                    i++;
                    ret = slice(ret, 1, length ret - 1);

                } elif $text[i] == "f" {
                    # formfeed; no idea what this is
                    i++;

                } elif $text[i] == "n" {
                    # Newline
                    ret &= "\n";
                    i++;
                
                } elif $text[i] == "r" {
                    # Carriage return...
                    ret &= "\r";
                    i++;
                
                } elif $text[i] == "t" {
                    # Tab! Be extra careful when dealing with these, as they are considered equal to 0
                    ret &= "\t";
                    i++;
                
                } elif $text[i] == "u" {
                    i++;
                    # 4 hex digits
                    local _hex_dgts = "";
                    repeat 4 {
                        if $text[i] not in HEX_DIGITS {
                            # error
                        }
                        _hex_dgts &= $text[i];
                        i++;
                    }
                    # Not really sure how these work ;-;
                    # ret &= chr("0x" & _hex_dgts);
                } else {
                    # error
                }

            } else {
                ret &= $text[i];
                i++;
            }
            i++;
        }
    }
    # return ret;
    return i;
}

func read_value(i, text) {
    local i = read_whitespace($i, $text);


    local j = read_string(i, $text);
    if j != 0 {
        j = read_whitespace(j, $text);
        return j;
    }

    j = read_number(i, $text);
    if j != 0 {
        j = read_whitespace(j, $text);
        return j;
    }

    # j = read_object(i, $text);
    # ...

    # array

    # bools
    if startswith_from_idx($text, "true", i) {
        j = i + 4;
        j = read_whitespace(j, $text);
        return j;
    }

    if startswith_from_idx($text, "false", i) {
        j = i + 5;
        j = read_whitespace(j, $text);
        return j;
    }

    if startswith_from_idx($text, "null", i) {
        # Not sure how to parse this to scratch
        j = i + 4;
        j = read_whitespace(j, $text);
        return j;
    }



}

func read_array(i, text) {
    local i = $i;

    if $text[i] != "[" {
        # error
    }
    
    until i >= length $text or i == 0 {
        local old_i = i;
        i = read_value(i, $text);

        if i != 0{
            if $text[i] != "," {
                # error
            } else {
                i++;
            }

            i = read_whitespace(i, $text); # I think this is meant to be here?
            old_i = i;
        }
    }

    if $text[i] != "]" {
        # error
    } else {
        i++;
        return i;
    }
}

func read_object(i, text) {
    local i = $i;

    if $text[i] != "{" {
        # error
    }
    
    until i >= length $text or i == 0 {
        local old_i = i;
        i = read_value(i, $text);

        if i != 0{
            if $text[i] != ":" {
                # error
            } else {
                i++;
            }

            i = read_whitespace(i, $text); # I think this is meant to be here?

            i = read_value(i, $text);
            if i == 0 {
                # error
            } else {
                 if $text[i] != "," {
                    # error
                } else {
                    i++;
                }

                i = read_whitespace(i, $text);
            }

            old_i = i;
        }
    }

    if $text[i] != "}" {
        # error
    } else {
        i++;
        return i;
    }
}

