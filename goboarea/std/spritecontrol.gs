# module allowing for more control over the sprite's attributes
# This includes:
# - Pos/size hack
%include std\\math.gs

costumes "std\\size0.svg", "std\\size1.svg", "std\\size2.svg";

struct pos {
    # Struct storing a sprite position - x, y, size & dir
    x, # x
    y, # y
    s, # size
    d  # direction
}

func my_pos() pos {
    return pos{
        x: x_position(),
        y: y_position(),
        s: size(),
        d: direction()
    };
}

func mouse_pos() pos {
    return pos{
        x: mouse_x(),
        y: mouse_y(),
        s: 100,
        d: 90
    };
}


func costume_count() {
    local old_costume = costume_number();
    switch_costume 0;
    local ret = costume_number();
    switch_costume old_costume;
    return ret;
}

# - Sound effect utils -
nowarp proc get_sound_length sound, inaccuracy {
    # Return by setting the "sound_length" variable
    set_pitch_effect_to_speed $inaccuracy;
    local start = timer();
    play_sound_until_done $sound;
    sound_length = (timer() - start) * $speed;
}

func speed_to_pitch(speed) {
    # This could be changed to a macro
    return ln($speed) / 0.0057762265046662105; # ln(2) / 120
}

func pitch_to_speed(pitch) {
    return antiln($pitch * 0.0057762265046662105);
}

proc set_pitch_effect_to_speed speed {
    set_pitch_effect speed_to_pitch($speed);
}

# - Movement stuff -
proc shift_rotation_centre pos shift {
    goto x_position() + $shift.y * cos(direction()) - $shift.x * sin(direction()),
         y_position() - $shift.y * sin(direction()) + $shift.x * cos(direction());
}

proc point_to_pos pos target {
    point_in_direction DIR($target.x, $target.y, x_position(), y_position());
}

# - bypass fencing -

proc goto_pos pos pos {
    position $pos.x, $pos.y, $pos.s, $pos.d;
}

proc change_xy dx, dy {
    # Even with tw no fencing enabled, this is not equivalent to change x by dx; change y by dy;
    # because it causes differences when the pen is down
    pos_hack x_position() + dx, y_position() + dy;
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

# - sprite ordering -
# Griffpatch layering tutorial: https://www.youtube.com/watch?v=bxjbYJLAUYU
proc order_sprite z_level{
    # THIS PROCEDURE REQUIRES A LIST 'z_order' TO BE DECLARED IN THE STAGE
    # In stage.gs, write: list z_order;
    local i = 1;
    until $z_level >= z_order[i] {
        i++;
    }
    insert $z_level at z_order[i];
    go_forward i - 1;
}