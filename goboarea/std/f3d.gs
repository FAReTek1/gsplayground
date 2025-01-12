# Fisheye '3D' stretching
# Inspired by @kobajin on scratch
# The engine assumes to have 5 costumes each for x/y rot + the original costume

%include std\\spritecontrol.gs
# %include std\\geo2d.gs

%define _CHECK_LAYER_BUG(theta) (theta - 87) % 180 < 6

func check_draw_at_rot(theta) {
    return not(_CHECK_LAYER_BUG($theta)) and ($theta - 90) % 360 > 180;
}

proc _f3d_by_x cost, xw, coef, WxH og {
    switch_costume $cost;
    local WxH dims = costume_dimensions[costume_number()];

    local w = -0.5 * ($xw - 1) * $og.w;
    local wh = dims.w - $og.w / 2;
    local dst = wh / 2 - $og.w / 4;

    local Polar p1 = Polar{r: dst / dims.w, t:90};
    local Polar p2 = Polar{r: (dst + w) / dims.w, t:90};

    set_fisheye_effect inverse_fisheye(p1, p2);

    hack_steps $coef * w;
}

proc _f3d_by_y cost, yw, coef, WxH og {
    switch_costume $cost;
    local WxH dims = costume_dimensions[costume_number()];

    local w = -0.5 * ($yw - 1) * $og.h;
    local wh = dims.h - $og.h / 2;
    local dst = wh / 2 - $og.h / 4;

    local Polar p1 = Polar{r: dst / dims.h, t:90};
    local Polar p2 = Polar{r: (dst + w) / dims.h, t:90};

    set_fisheye_effect inverse_fisheye(p1, p2);

    turn_left 90;
    hack_steps $coef * w;
    turn_right 90;
}

func f3d_stretch_wh(cost, xw, yw, flip) {
    # Stretch with a given width or height
    # Returns whether you should stamp or not
    switch_costume $cost & " OG";
    local WxH ogdims = costume_dimensions[costume_number()];
    local stp = true;
    if $xw > "" {
        if $xw > 0 {
            if $flip {
                _f3d_by_x $cost & " LN", $xw, size() / -100, ogdims;
            } else {
                _f3d_by_x $cost & " RN", $xw, size() / 100, ogdims;
            }
        } elif $xw < 0 {
            if $flip {
                _f3d_by_x $cost & " RF", -$xw, size() / 100, ogdims;
            } else {
                _f3d_by_x $cost & " LF", -$xw, size() / -100, ogdims;
            }
        } else {
            stp = false;
        }

    } elif $yw > "" {
        if $yw > 0 {
            if $flip {
                _f3d_by_y $cost & " DN", $yw, size() / -100, ogdims;
            } else {
                _f3d_by_y $cost & " UN", $yw, size() / 100, ogdims;
            }
        } elif $yw < 0 {
            if $flip {
                _f3d_by_y $cost & " UF", -$yw, size() / 100, ogdims;
            } else {
                _f3d_by_y $cost & " DF", -$yw, size() / -100, ogdims;
            }
        } else {
            stp = false;
        }
    }
    return stp;
}

func f3d(cost, xd, yd) {
    # Apply a fisheye 3D stretch. Returns whether to stamp or not
    if $xd > "" {
        local stp = f3d_stretch_wh($cost, cos($xd), "", $xd % 360 > 180);
    } elif $yd > "" {
        local stp = f3d_stretch_wh($cost, "", cos($yd), $yd % 360 > 180);
    }
    return stp;
}

proc f3d_prism pos p, cost, xd, yd, layer_count, depth {
    local i = 0;
    repeat $layer_count{
        goto_pos $p;

        if $xd > "" {
            hack_steps i;

            if _CHECK_LAYER_BUG($xd) {
                switch_costume $cost & " XF";
                stamp;

            } elif f3d_stretch_wh($cost, cos($xd), "", $xd % 360 > 180) {
                stamp;
            }
            
        } else {
            turn_left 90;
            hack_steps i;
            turn_right 90;

            if _CHECK_LAYER_BUG($yd) {
                switch_costume $cost & " YF";
                stamp;

            } elif f3d_stretch_wh($cost, "", cos($yd), $yd % 360 > 180) {
                stamp;
            }
        }

        i += ($depth / $layer_count) * sin($xd + $yd); # If it has some rotation, this affects the perceived depth
    }
}