# module allowing for more control over the sprite's attributes
# This includes:
# - Pos/size hack
# %include std\\math.gs
%include std\\geo2d.gs

costumes "std\\size0.svg", "std\\size1.svg", "std\\size2.svg";

struct pos {
    # Struct storing a sprite position - x, y, size & dir
    x, y, # pos
    s, # size
    d  # direction
}

struct WxH {w, h} # Width & height

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

# - Costume utils -

func costume_count() {
    local old_costume = costume_number();
    switch_costume 0;
    local ret = costume_number();
    switch_costume old_costume;
    return ret;
}

list WxH costume_dimensions;
proc cache_costume_dims{
    delete costume_dimensions;

    local i = 1;
    local ct = costume_count();
    repeat ct { 
        # You could actually do a repeat until costume # == 1 but
        # you have to make sure it does the first iteration
        switch_costume i;
        add measure_costume_wxh() to costume_dimensions;        
        i++;
    }
}

func measure_costume_wxh() WxH {
    return WxH{
        w: measure_costume_width(),
        h: measure_costume_height()
    };
}

func measure_costume_width(){
    return _measure_width(size(), 0, x_position(), y_position());
}

func measure_costume_height(){
    turn_right 90;
    local ret = _measure_width(size(), 0, x_position(), y_position());
    turn_left 90;
    return ret;
}
func _measure_width(s, rd, x, y) { # rd = recursion depth
    size_hack($s);

    goto "Infinity", 0;
    local width = x_position() - 240;
    goto "-Infinity", 0;
    width += -210 - x_position();

    if width > 40 {
        pos_hack $x, $y;
        return (width / size()) * 100;

    } elif $rd > 2 {
        pos_hack $x, $y;
        return 0;
    }

    else {
        return _measure_width(10 * $s, 1 + $rd, $x, $y);
    }
}

# - fisheye/whirl utils -
%define NORM_FISHEYE(f) (((f) + 100) / 100)
%define DENORM_FISHEYE(f) ((f) * 100 - 100)
func apply_fisheye(f, Polar p) Polar {
    return Polar{
        r: POW(2 * $p.r, 1 / NORM_FISHEYE($f)) / 2,
        t: $p.t
    };
}

func inverse_fisheye(Polar old, Polar new) {
    return DENORM_FISHEYE((ln(2 * $old.r) / ln(2 * $new.r)));
}

%define NORM_WHIRL(w) ((w) * 0.01745329251) # pi / 180
%define DENORM_WHIRL(w) ((w) / 0.01745329251)
func apply_whirl(w, Polar p) Polar {
    return Polar{
        r: $p.r,
        t: $p.t - NORM_WHIRL($w) * antiln(0.6931471805599453 - 1.3862943611198906 * $p.r) # 1 - 2r^2
    };
}

func inverse_whirl(Polar old, Polar new) {
    return DENORM_WHIRL(($old.t - $new.t) / antiln(0.6931471805599453 - 1.3862943611198906 * $old.r));
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
    pos_hack x_position() + $dx, y_position() + $dy;
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

proc hack_steps steps {
    change_xy $steps * sin(direction()),
              $steps * cos(direction());
}

%define RESET_POS goto 0,0; size_hack 100; point_in_direction 90;

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
