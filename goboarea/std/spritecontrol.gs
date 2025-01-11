# module allowing for more control over the sprite.
# This includes:
# - Pos/size hack

costumes "std\\size0.svg", "std\\size1.svg", "std\\size2.svg";

struct pos {
    # Struct storing a sprite position - x, y, size & dir
    x, # x
    y, # y
    s, # size
    d  # direction
}

func costume_count() {
    local old_costume = costume_number();
    switch_costume 0;
    local ret = costume_number();
    switch_costume old_costume;
    return ret;
}

proc goto_pos pos pos {
    position pos.x, pos.y, pos.s, pos.d;
}

proc size_hack size {
    local old_costume = costume_number();
    
    switch_costume "size" & ($size < 100) + ($size < 1);
    set_size $size;

    switch_costume old_costume;
}



proc pos_size_hack x, y, size {
    local old_costume = costume_number();
    
    switch_costume "size0";
    set_size "Infinity";

    goto $x, $y;

    switch_costume "size" & ($size < 100) + ($size < 1);
    set_size $size;

    switch_costume old_costume;
}

proc pos_hack x, y {
    # Just call the other function. It's easier and we'd have to store the size anyway
    pos_size_hack $x, $y, size();
}

proc position x, y, size, dir {
    # Set x, y, size and dir all in one procedure
    pos_size_hack $x, $y, $size;
    point_in_direction $dir;
}
