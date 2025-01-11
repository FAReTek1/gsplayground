# your favourite system for dealing with an alts list like ashibara_art
# This can be used when you have to work with recursive functions
# This system is designed based on faretek1's vars list

list alts;
proc alts_at i, opcode, value {
    if opcode == "=" {
        alts[$i] = $value;

    } elif opcode == "+=" {
        alts[$i] += $value;

    } elif opcode == "-=" {
        alts[$i] -= $value;

    } elif opcode == "*=" {
        alts[$i] *= $value;

    } elif opcode == "/=" {
        alts[$i] /= $value;

    } elif opcode == "//=" {
        alts[$i] //= $value;
    
    } elif opcode == "&=" {
        alts[$i] &= $value;
    }
}

proc alts_after chunk, i, opcode, value {
    if $i > $chunk {
        alts_at $i, $opcode, $value;
    } else {
        alts_at $i + (length alts - $chunk), $opcode, $value;
    }
}

proc alts_slice start, end, opcode, value {
    local i = $start;
    repeat $end - $start {
        alts_at i $opcode, $value;
        i ++;
    }
}

proc alts_clean count {
    local i = $count;
    repeat $count {
        alts[i] = alts[length alts];
        delete alts[length alts];
        i --;
    }
}

proc alts_new count {
    local i = 1;
    repeat $count {
        add alts[i] to alts;
        i ++;
    }
}

proc alts_init count {
    delete alts;
    repeat $count {
        add "" to alts;
    }
}

proc alts_clean_and_set count, i, value {
    alts_clean $count;
    alts[$i] = $value;
}
