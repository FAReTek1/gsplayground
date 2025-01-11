# Bitwise operators

func bitw_and (bits1, bits2) {
    # Perform a bitwise AND on two strings. Assumes that they are equal length
    local i = 1;

    ret = "";
    repeat length($bits1) {
        ret &= "" + ($bits1[i] and $bits2[i]);

        i += 1;
    }

    return ret;
}
