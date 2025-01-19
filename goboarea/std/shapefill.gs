# Collection of filling algorithms ported to goboscript.
# Credits for each algorithm will be provided.

# draw <shape> = draw outline
# fill <shape> = fill in interior of shape

%include std\\math.gs
%include std\\spritecontrol.gs

# - Basic scripts -
%define PEN_DU pen_down; pen_up;

proc draw_ptx2 PtX2 pts {
    if $pts.x1 == ("" + $pts.x1) {
        goto $pts.x1, $pts.y1;
        pen_down; pen_up;
    }
    if $pts.x2 == ("" + $pts.x2){
        goto $pts.x2, $pts.y2;
        pen_down; pen_up;
    }
}


proc draw_box Box b {
    goto $b.xmin, $b.ymin; pen_down;

    goto $b.xmin, $b.ymax;
    goto $b.xmax, $b.ymax;
    goto $b.xmax, $b.ymin;

    goto $b.xmin, $b.ymin; pen_up;
}

# -- Line (2D) --
proc draw_line Line2D l {
    # We only check x1
    if $l.x1 != "NaN"{
        goto $l.x1, $l.y1;
        pen_down;
        goto $l.x2, $l.y2;
        pen_up;
    }
}

# -- Regular poly --
proc draw_regply pos p, sides {
    local angle = $p.d;
    repeat $sides + 1 {
        goto $p.x + $p.s * sin(angle),
             $p.y + $p.s * cos(angle);
        pen_down;
        angle += 360 / $sides;
    }
    pen_up;
}

# Based on the regular-poly filler by @sockeye-d on scratch
proc fill_regply pos p, sides, res {
    local i_mul = 2 * cos(180 / $sides);
    local s_mul = (2 - i_mul) / 4;

    goto $p.x, $p.y;
    set_pen_size $p.s * i_mul;
    pen_down;

    local p_mul = s_mul;
    repeat $res {
        set_pen_size $p.s * i_mul * p_mul;

        local r = $p.s * (1 - p_mul);
        local angle = $p.d;

        repeat $sides + 1 {
            goto $p.x + r * sin(angle),
                 $p.y + r * cos(angle);
            angle += 360 / $sides;
        }

        p_mul *= s_mul;
    }
    pen_up;
}

# Miter fillers by @faretek1 on scratch
proc fill_miter Line2D l1, Line2D l2, th {
    # Assume l2.x1, l2.y2 to be equal to l1.x2, l1.y2
    local dst1 = line_length($l1);
    local v1x = (line_dx($l1) / dst1) * (($th - 1) / 2);
    local v1y = (line_dy($l1) / dst1) * (($th - 1) / 2);

    local dst2 = line_length($l2);
    local v2x = (line_dx2($l2) / dst2) * (($th - 1) / 2);
    local v2y = (line_dy2($l2) / dst2) * (($th - 1) / 2);

    local cmp1 = (v1x * v2y) + abs(v1y * v2x);
    local cmp2 = (v1y * v2x) - abs(v1x * v2y);

    if cmp1 <= 0 or cmp2 >= 0 {
        local cmp3 = v1x * v2y - v1y * v2x;
        if cmp3 == 0 {
            fill_miter Line2D{
                x1: $l1.x1, 
                y1: $l1.y1,
                x2: $l1.x2,
                y2: $l1.y2 + 0.5
            }, Line2D{
                x1: $l2.x1, 
                y1: $l2.y1 + 0.5,
                x2: $l2.x2,
                y2: $l2.y2 + 0.5
            }, $th; 
        }

        local Pt2D ints = intersect_l2d(
            Line2D{
                x1: ($l1.x1 + v1y),
                y1: ($l1.y1 - v1x),
                x2: ($l1.x1 + v1y) + v1x,
                y2: ($l1.y1 - v1x) + v1y
            },
            Line2D{
                x1: ($l2.x2 - v2y),
                y1: ($l2.y2 + v2x),
                x2: ($l2.x2 - v2y) + v2x,
                y2: ($l2.y2 + v2x) + v2y
            }
        );
            
        fill_tri
            ints.x, ints.y,
            $l1.x2 + v1y, $l1.y2 - v1x,
            $l1.x2 - v2y, $l1.y2 + v2x;

    } else {
        fill_miter Line2D{
                x1: $l2.x2, 
                y1: $l2.y2,
                x2: $l2.x1,
                y2: $l2.y1
            }, Line2D{
                x1: $l1.x2, 
                y1: $l1.y2,
                x2: $l1.x1,
                y2: $l1.y1
            }, $th; 
    }

}
# Fill miter using arc instead of tri
# Probably not very efficient math
proc fill_miter_arc Line2D l1, Line2D l2, th {
    # Assume l2.x1, l2.y2 to be equal to l1.x2, l1.y2
    local dst1 = line_length($l1);
    local v1x = (line_dx($l1) / dst1) * ($th / 2);
    local v1y = (line_dy($l1) / dst1) * ($th / 2);

    local dst2 = line_length($l2);
    local v2x = (line_dx2($l2) / dst2) * ($th / 2);
    local v2y = (line_dy2($l2) / dst2) * ($th / 2);

    local cmp1 = (v1x * v2y) + abs(v1y * v2x);
    local cmp2 = (v1y * v2x) - abs(v1x * v2y);

    if cmp1 <= 0 or cmp2 >= 0 {
        local cmp3 = v1x * v2y - v1y * v2x;
        if cmp3 == 0 {
            fill_miter_arc Line2D{
                x1: $l1.x1, 
                y1: $l1.y1,
                x2: $l1.x2,
                y2: $l1.y2 + 0.5
            }, Line2D{
                x1: $l2.x1, 
                y1: $l2.y1 + 0.5,
                x2: $l2.x2,
                y2: $l2.y2 + 0.5
            }, $th; 
        } else {
            local Pt2D ints = intersect_l2d(
                Line2D{
                    x1: ($l1.x1 + v1y),
                    y1: ($l1.y1 - v1x),
                    x2: ($l1.x1 + v1y) + v1x,
                    y2: ($l1.y1 - v1x) + v1y
                },
                Line2D{
                    x1: ($l2.x2 - v2y),
                    y1: ($l2.y2 + v2x),
                    x2: ($l2.x2 - v2y) + v2x,
                    y2: ($l2.y2 + v2x) + v2y
                }
            );

            local dr1 = DIR($l1.x2 + v1y, $l1.y2 - v1x, ints.x, ints.y);
            local dr2 = DIR($l1.x2 - v2y, $l1.y2 + v2x, ints.x, ints.y);

            local cmp4 = ((dr2 % 360) - (dr1 % 360)) % 360;
            if cmp4 % 180 < 2 {
                fill_tri
                    ints.x, ints.y,
                    $l1.x2 + v1y, $l1.y2 - v1x,
                    $l1.x2 - v2y, $l1.y2 + v2x;

            } else {
                if cmp4 >= 1 {
                    fill_arc pos_from_pt2d(
                        ints, 
                        2 * DIST(ints.x, ints.y, $l1.x2 + v1y, $l1.y2 - v1x),
                        dr1 % 360), 
                        cmp4, 0;
                }
            }
        }
    } else {
        fill_miter_arc Line2D{
                x1: $l2.x2, 
                y1: $l2.y2,
                x2: $l2.x1,
                y2: $l2.y1
            }, Line2D{
                x1: $l1.x2, 
                y1: $l1.y2,
                x2: $l1.x1,
                y2: $l1.y1
            }, $th; 
    }
}

# -- Circle --
proc fill_circle Circle c {
    # literally paint a dot
    goto $c.x, $c.y;
    set_pen_size 2 * $c.r;
    pen_down; pen_up;
}

proc draw_circle Circle c, res {
    local angle = 0;
    goto $c.x, $c.y + $c.r;
    pen_down;

    repeat $res {
        angle += 360 / $res;
        goto $c.x + $c.r * sin(angle), $c.y + $c.r * cos(angle);
    }

    pen_up;
}

proc clip_circles Circle c1, Circle c2 {
    # render the intersection between 2 circles. todo: make a struct that this outputs and seperate rendering and clipping
    local PtX2 isct = intersect_circles($c1, $c2);
    if isct.x1 == intersect_circle_error_codes.circinside {
        if $c1.r > $c2.r {
            fill_circle $c2;
        } else {
            fill_circle $c1;
        }
        
    } elif isct.x1 != intersect_circle_error_codes.notouch {
        local d1 = DIR($c2.x, $c2.y, isct.x2, isct.y2);
        local d2 = DIR($c2.x, $c2.y, isct.x1, isct.y1);

        if d1 < d2 {
            fill_segment pos_from_circle($c2, 180 + d1), -360 + (d2 - d1);
        } else {
            fill_segment pos_from_circle($c2, 180 + d1), d2 - d1;
        }

        d1 = DIR($c1.x, $c1.y, isct.x2, isct.y2);
        d2 = DIR($c1.x, $c1.y, isct.x1, isct.y1);

        if d1 < d2 {
            fill_segment pos_from_circle($c1, 180 + d2), d1 - d2;
        } else {
            fill_segment pos_from_circle($c1, 180 + d2), -360 + (d1 - d2);
        }
    }
}

# -- Dynamic width line (defined by 2 circles) --
proc _shapefill_inner_fill_dw_line_fast Circle c1, Circle c2, dx, dy{
    # Fast line fill, but not 100% accurate
    local dst = sqrt($dx * $dx + $dy * $dy);

    local vx = $dy / -dst;
    local vy = $dx / dst;

    local th = $c1.r / 4;
    set_pen_size $c1.r;
    goto $c1.x, $c1.y;
    pen_down;

    local x = $c1.x;
    local y = $c1.y;
    local done = false;

    until done {
        local m = (2 * th - $c1.r) / ($c2.r - $c1.r);

        if m > 1 {
            done = true;
            th = th * 2 - $c2.r * 0.5;
            
            set_pen_size $c2.r;

            goto x + th * vx, y + th * vy;
            goto $c2.x, $c2.y;
            goto x - th * vx, y - th * vy;

            pen_up;
        } else {
            local ox = x;
            local oy = y;

            x = $c1.x + m * $dx;
            y = $c1.y + m * $dy;

            set_pen_size 2 * th;
            goto ox + th * vx, oy + th * vy;
            goto x, y;
            goto ox - th * vx, oy - th * vy;

            th *= 0.5;
        }
    }

}

proc fill_dw_line_fast Circle c1, Circle c2 {
    if $c1.r == $c2.r {
        set_pen_size $c1.r * 2;
        goto $c1.x, $c1.y;
        pen_down;
        goto $c2.x, $c2.y;
        pen_up;

    } elif $c1.r > $c2.r {
        _shapefill_inner_fill_dw_line_fast Circle{x: $c1.x, y: $c1.y, r: $c1.r * 2},
                                           Circle{x: $c2.x, y: $c2.y, r: $c2.r * 2},
                                           $c2.x - $c1.x, $c2.y - $c1.y;
    } else {
        _shapefill_inner_fill_dw_line_fast Circle{x: $c2.x, y: $c2.y, r: $c2.r * 2},
                                           Circle{x: $c1.x, y: $c1.y, r: $c1.r * 2},
                                           $c1.x - $c2.x, $c1.y - $c2.y;
    }
}

# -- crescent fill/draw by @faretek1 on scratch --
# There is potentially a more optimal algo for this
# A crescent is defined by a main circle and a second circle cut out of it.
proc draw_crescent Circle c1, Circle c2, res {
    local PtX2 isct = intersect_circles($c1, $c2);
    if isct.x1 == intersect_circle_error_codes.notouch {
        draw_circle $c1, $res;
    } elif isct.x1 == intersect_circle_error_codes.circinside {
        if $c1.r > $c2.r {
            draw_circle $c1, $res;
            draw_circle $c2, $res;
        }

    } else {
        local d1 = DIR($c2.x, $c2.y, isct.x2, isct.y2);
        local d2 = DIR($c2.x, $c2.y, isct.x1, isct.y1);

        if d1 < d2 {
            draw_arc_edge pos_from_circle($c2, 180 + d1), -360 + (d2 - d1), $res;
        } else {
            draw_arc_edge pos_from_circle($c2, 180 + d1), d2 - d1, $res;
        }

        d1 = DIR($c1.x, $c1.y, isct.x2, isct.y2);
        d2 = DIR($c1.x, $c1.y, isct.x1, isct.y1);

        if d1 < d2 {
            draw_arc_edge pos_from_circle($c1, 180 + d1), -360 + (d2 - d1), $res;
        } else {
            draw_arc_edge pos_from_circle($c1, 180 + d1), d2 - d1, $res;
        }
    }
}

# There may be a more efficient way to do a crescent using stamps, however it eludes me right now
proc _shapefill_inner_crescent Circle c1, Circle c2, Circle a, dst, dx, dy, flip, res {
    if $dst > $c1.r + $c2.r {
        goto $c1.x, $c1.y;
        set_pen_size 2 * $c1.r;
        PEN_DU;
    } else {
        if $dst < abs($c1.r - $c2.r) and $flip {
            stop_this_script;
        } 
        local b = $a.r * sqrt(1 - ($dst * $dst) / (4 * $a.r * $a.r));
        local a1 = (($c1.r * $c1.r - $c2.r * $c2.r) + $dst * $dst) / (2 * $dst);
        local h1 = sqrt($c1.r * $c1.r - a1 * a1);

        local t1 = 360 + acos(h1 / b);
        local t2 = 180 - acos(h1 / b);

        if $flip {
            t1 -= 180;
            t2 += 180;
        }

        local v1 = $dx / $dst;
        local v2 = $dy / $dst;

        local t = t1;
        local f1 = $a.r * sin(t);
        local f2 = b * cos(t);

        repeat $res + 1 {
            local nf1 = $a.r * sin(t + (t2 - t1) / $res);
            local nf2 = b * cos(t + (t2 - t1) / $res);

            local x = $a.x + v1 * nf1 + v2 * nf2;
            local y = ($a.y + v2 * nf1) - v1 * nf2;
            local th = 2 * ((DIST($c2.x, $c2.y, x, y)) - $c2.r);
            
            goto $a.x + v1 * f1 + v2 * f2,
                 ($a.y + v2 * f1) - v1 * f2;
            
            local th2 = 2 * ((DIST($c2.x, $c2.y, x_position(), y_position())) - $c2.r);
            if th2 > th {
                set_pen_size th;
            } else {
                set_pen_size th2;
            }
            pen_down;

            t += (t2 - t1) / $res;
            f1 = nf1;
            f2 = nf2; 
        }
        pen_up;
    }
}

proc fill_crescent Circle c1, Circle c2, res {
    if $c1.x == $c2.x and $c1.y == $c2.y {
        fill_crescent $c1, Circle{x: $c2.x, y: $c2.y + "1e-5", r: $c2.r}, $res;
    } else {
        _shapefill_inner_crescent $c1, $c2, Circle{
                                      x: ($c1.x + $c2.x) / 2,
                                      y: ($c1.y + $c2.y) / 2,
                                      r: ($c1.r + $c2.r) / 2
                                  },
                                  DIST($c1.x, $c1.y, $c2.x, $c2.y), 
                                  $c2.x - $c1.x, $c2.y - $c1.y,
                                  $c1.r < $c2.r, 2 * $res + 1;
    }
}

# -- Capped line by @faretek1 on scratch
costumes "std\\shapefill pencap opaq.svg", "std\\shapefill pencap trans.svg";

proc fill_capped_line x1, y1, x2, y2, th, trans {
    local dst = DIST($x1, $y1, $x2, $y2);
    if dst < $th {
        local mul = ($th / 2) / dst; 

        # tail recursion is ok
        local mdx = ($x1 + $x2) / 2;
        local mdy = ($y1 + $y2) / 2;

        local dx = $x1 - $x2;
        local dy = $y1 - $y2;

        fill_capped_line mdx - dy * mul,
                         mdy + dx * mul,
                         mdx + dy * mul,
                         mdy - dx * mul,
                         dst,
                         $trans;
        
    } else {
        if $trans > 0 {
            local cost = "shapefill pencap trans";
        } else {
            local cost = "shapefill pencap opaq";
        }

        point_in_direction DIR($x1, $y1, $x2, $y2);

        switch_costume cost;
        pos_size_hack $x2 + (dst - $th / 2) * sin(direction()),
                      $y2 + (dst - $th / 2) * cos(direction()),
                      $th;

        set_ghost_effect $trans;
        stamp;
        # set_pen_transparency 100;  # This block doesn't exist yet in goboscript ;-;
        set_pen_size $th;
        pen_down;
        # set_pen_transparency $trans;  # This block doesn't exist yet in goboscript ;-;
        
        turn_right 180;
        pos_size_hack $x1 + (dst - $th / 2) * sin(direction()),
                      $y1 + (dst - $th / 2) * cos(direction()),
                      $th;
        pen_up;
        stamp;
    }
}

# -- Azex fixed res copied over by Triducal
proc fill_tri x1, y1, x2, y2, x3, y3 {
    local la = sqrt(($x2 - $x3) * ($x2 - $x3) + ($y2 - $y3) * ($y2 - $y3));
    local lb = sqrt(($x3 - $x1) * ($x3 - $x1) + ($y3 - $y1) * ($y3 - $y1));
    local lc = sqrt(($x2 - $x1) * ($x2 - $x1) + ($y2 - $y1) * ($y2 - $y1));
    local p = la + lb + lc;

    goto ((la * $x1) + (lb * $x2) + (lc * $x3)) / p,
        ((la * $y1) + (lb * $y2) + (lc * $y3)) / p;

    local a = (x_position() - $x1);
    local b = (y_position() - $y1);
    local c = (x_position() - $x2);
    local d = (y_position() - $y2);
    local e = (x_position() - $x3);
    local f = (y_position() - $y3);
    local r = sqrt((p - la * 2) * (p - lb * 2) * (p - lc * 2) / p);

    if la < lb and la < lc {
        la = 0.5 - (r / (4 * sqrt(a * a + b * b)));
    } else {
        if lb < lc {
            la = 0.5 - (r / (4 * sqrt(c * c + d * d)));
        } else {
            la = 0.5 - (r / (4 * sqrt(e * e + f * f)));
        }
    }

    set_pen_size r;
    pen_down;
    lb = la;

    repeat ceil(-1.6 - (ln(r) / ln(lb))) {
        set_pen_size la * r + 2;
        goto $x1 + (la * a), $y1 + (la * b);
        goto $x2 + (la * c), $y2 + (la * d);
        goto $x3 + (la * e), $y3 + (la * f);
        goto $x1 + (la * a), $y1 + (la * b);
        la = la * lb;
    }

    set_pen_size 2;
    goto $x1, $y1;
    goto $x2, $y2;
    goto $x3, $y3;
    goto $x1, $y1;
    pen_up;
}

# -- segment fill by @faretek1 on scratch --
costumes "std\\segment\\*.svg";

proc fill_segment pos pos, ext {
    if $ext > 0.703125 {
        local i = floor(ln($ext / 360) / 0.6931471805599453);
        switch_costume "shapefill segment " & i;

        pos_hack $pos.x, $pos.y;
        size_hack $pos.s * 2;
        point_in_direction $pos.d;

        stamp;

        i = 360 * antiln(i * 0.6931471805599453);
        if abs(i - $ext) > 0.0000000000001 {
            turn_right $ext - i;
            stamp;
            local fin = $pos.d + $ext;
            local md = $pos.d + $ext / 2;

            switch_costume "size0";
            set_size "Infinity";
            fill_tri sin($pos.d) * $pos.s + $pos.x,
                     cos($pos.d) * $pos.s + $pos.y,
                     sin(fin) * $pos.s + $pos.x,
                     cos(fin) * $pos.s + $pos.y,
                     sin(md) * $pos.s + $pos.x,
                     cos(md) * $pos.s + $pos.y;
        }
    } elif $ext < -0.703125 {
        fill_segment pos{x: $pos.x, y: $pos.y, s: $pos.s, d: $pos.d + $ext}, -$ext;
    } 
}

proc draw_segment pos p, ext, res {
    goto $p.x + $p.s * sin($p.d), 
         $p.y + $p.s * cos($p.d);
    pen_down;

    local angle = $p.d;
    repeat $res {
        angle += $ext / $res;
        goto $p.x + $p.s * sin(angle),
             $p.y + $p.s * cos(angle);
    }

    goto $p.x + $p.s * sin($p.d), 
         $p.y + $p.s * cos($p.d);

    pen_up;
}

# -- arc fill by @faretek1 on scratch --
# Original technique by spinningcube
costumes "std\\arc\\*.svg";

proc fill_arc pos pos, ext, hole {
    if $ext > 0.703125 and $hole < 0.9999999 {
        goto_pos $pos;

        local i = floor(ln($ext / 360) / 0.6931471805599453);
        switch_costume "shapefill arc " & $hole > 0.01 & i;

        if $hole > 0.01 {
            set_fisheye_effect -69.314718056 / ln($hole) - 100;
        }
        stamp;
        i = 360 * antiln(0.6931471805599453 * i);
        if abs(i - $ext) > 0.0000000000001 {
            turn_right $ext - i;
            stamp;
        }
        set_fisheye_effect 0;
    }
}

proc draw_arc_edge pos p, ext, res {
    goto $p.x + $p.s * sin($p.d), 
         $p.y + $p.s * cos($p.d);
    pen_down;

    local angle = $p.d;

    repeat $res {
        angle += $ext / $res;
        goto $p.x + $p.s * sin(angle),
             $p.y + $p.s * cos(angle);
    }

    pen_up;
}

# -- 'Cone'/pen-cap filler by @faretek1 and @wolther on scratch --
costumes "std\\cone\\*.svg";

proc fill_cone pos p, ext {
    if 0 < $ext and $ext < 180 {
        local r1 = $p.s / cos($ext / 2);
        local r2 = $p.s / cos($ext / 4);
        fill_tri $p.x + r1 * sin($p.d + $ext / 2),
                 $p.y + r1 * cos($p.d + $ext / 2),
                 $p.x + r2 * sin($p.d + $ext / 4),
                 $p.y + r2 * cos($p.d + $ext / 4),
                 $p.x + r2 * sin($p.d + $ext * 0.75),
                 $p.y + r2 * cos($p.d + $ext * 0.75);

        goto_pos pos{
            x: $p.x, y: $p.y,
            s: $p.s * 2,
            d: $p.d
        };

        local i = ceil(log(360 / $ext) / 0.301);
        switch_costume "shapefill cone" & i;
        stamp;

        turn_right $ext - 360 / antilog(0.301 * i);
        stamp;
    }
}

# -- Arrow filler for intros adapted from https://scratch.mit.edu/projects/1046239626/ --
# Costumes by @infinitto on scratch
# Uses a specific size that cannot be changed here. If you want dynamic width, make one using 2 quad fills
costumes "std\\aw\\*.svg";

proc fill_AW pos pos, hole {
    # Note: this filler is a bit stuttery and doesn't work sometimes
    if $hole < 0 {
        fill_AW $pos, 0;

    } elif $hole < 1 {
        goto_pos $pos;
        if $hole * $pos.s == 0 {
            switch_costume "shapefill AW0";
            stamp;
        } else {
            if $hole < 0.5 {
                local i = floor(7 + ln($hole) / 0.69314718056);
                switch_costume "shapefill AW" & i;
                stamp;
                if $hole == 0.25 { # Removes the small gap created at 0.25 hole
                    size_hack $hole * $pos.s * 2.04;
                } else {
                    size_hack $hole * $pos.s * antiln(0.6931471805599453 * (6 - i));
                }
                stamp;
            } else {
                local i = ceil(5 + ln(2 - 2 * $hole) / -0.53479999674);
                switch_costume "shapefill AW" & i;
                stamp;
                if $hole != 0.5{
                    size_hack $pos.s + (
                        antiln(0.6931471805599453 * (4 - i)) * 
                        (2 * antiln(-0.5347999967394081 * (4.89 - i)) * ($pos.s * ($hole - 1)) + $pos.s)
                    ) / 0.707106781187;
                    stamp;
                }
            }
        }
    }
}

proc draw_AW pos pos, hole {
    if $hole < 0 {
        _inner_AW_draw $pos, 0, cos($pos.d), sin($pos.d), 
                       0.16 * $pos.s, 0.9 * $pos.s, 0;

    } elif $hole < 1 {
        _inner_AW_draw $pos, $pos.s * $hole, cos($pos.d), sin($pos.d), 
                       0.16 * $pos.s, 0.9 * $pos.s, 0.9 * $pos.s * $hole;
    }
}

proc _inner_AW_draw pos pos, s2, cosd, sind, rx, ry1, ry2 {
    goto $pos.x + $ry1 * $sind + $rx * $cosd,
         $pos.y + $ry1 * $cosd - $rx * $sind;

    pen_down;
    goto $pos.x + $pos.s * $sind, 
         $pos.y + $pos.s * $cosd;

    goto $pos.x + $ry1 * $sind - $rx * $cosd,
         $pos.y + $ry1 * $cosd + $rx * $sind;

    if $s2 == 0 {
        goto $pos.x, $pos.y;

    } else {
        goto $pos.x + $ry2 * $sind - 0.16 * $s2 * $cosd,
             $pos.y + $ry2 * $cosd + 0.16 * $s2 * $sind;

        goto $pos.x + $s2 * $sind,
             $pos.y + $s2 * $cosd;

        goto $pos.x + $ry2 * $sind + 0.16 * $s2 * $cosd,
             $pos.y + $ry2 * $cosd - 0.16 * $s2 * $sind;
    }
    goto $pos.x + $pos.s * (0.9 * $sind + 0.16 * $cosd),
         $pos.y + $pos.s * (0.9 * $cosd - 0.16 * $sind);
    pen_up;
}

# -- small utilities --
proc fill_outline res, th {
    local angle = 0;
    repeat $res {
        change_xy $th * sin(angle),
                  $th * cos(angle);
        stamp;
        change_xy -$th * sin(angle),
                  -$th * cos(angle);
        angle += 360 / $res;
    }
}

proc stamp_shadow dx, dy, ghost {
    change_xy dx, dy; change_ghost_effect $ghost;
    stamp;
    change_xy -dx, -dy; change_ghost_effect -$ghost;
}

# -- geo2d clip rendering --
proc _cnc_segment_by_coords Pt2D p1, Pt2D p2 {
    local d1 = ptdir($p1, circle_pt(cnc_circle)) % 360;
    local d2 = ptdir($p2, circle_pt(cnc_circle)) % 360;

    if d1 != d2 {
        if _cnc_flip == 1 {
            if d1 < d2 {
                fill_segment pos_from_circle(cnc_circle, d1), d2 - d1;
            } else {
                fill_segment pos_from_circle(cnc_circle, d1 - 360), d2 - (d1 - 360);
            }
        } else {
            if d1 < d1 {
                fill_segment pos_from_circle(cnc_circle, d2), d1 - d2;
            } else {
                fill_segment pos_from_circle(cnc_circle, d2 - 360), d1 - (d2 - 360);
            }
        }
    }
}

proc render_cnc {
    if _cnc_buffer1[1].x != "OUT POLY" {
        if length _cnc_buffer1 == 0 {
            fill_circle cnc_circle;

        } else {
            local Circle c = cnc_circle;
            local i = 2;
            repeat length _cnc_buffer1 - 2 {
                fill_tri 
                _cnc_buffer1[1].x, _cnc_buffer1[1].y,
                _cnc_buffer1[i].x, _cnc_buffer1[i].y,
                _cnc_buffer1[i + 1].x, _cnc_buffer1[i + 1].y;
                i++;
            }
            i = 1 + (_cnc_first == 0);
            repeat (length _cnc_buffer2 / 2) - (1 - _cnc_first) {
                _cnc_segment_by_coords _cnc_buffer2[i], _cnc_buffer2[i + 1];
                i += 2;
            }
            if _cnc_first == 0 {
                _cnc_segment_by_coords _cnc_buffer2[i], _cnc_buffer2[1];
            }
        }

    }
}

# -- Intro effect shapes --
proc fill_arc_starting_at pos p, ext, hole, center_rot, overall_size {
    fill_arc pos{
        x: $p.x - $p.s * sin($p.d),
        y: $p.y - $p.s * cos($p.d),
        s: $p.s * $overall_size,
        d: $p.d + $center_rot - $ext
    }, $ext, $hole;
}
proc fill_arc_ending_at pos p, ext, hole, center_rot, overall_size {
    fill_arc pos{
        x: $p.x - $p.s * sin($p.d),
        y: $p.y - $p.s * cos($p.d),
        s: $p.s * $overall_size,
        d: $p.d + $center_rot
    }, $ext, $hole;
}

proc draw_arc_CLE pos p, arcd, ext, hole, sz, ct, is_cw {
    # pos, arc dir, extent, thickness, arc size, arc count, clockwise or not
    local d = $p.d;
    repeat $ct {
        if $is_cw {
            fill_arc_starting_at pos{
                x: $p.x,
                y: $p.y,
                s: $p.s,
                d: d
            }, $ext, $hole, $arcd, $sz/100;
        } else {
            fill_arc_ending_at pos{
                x: $p.x,
                y: $p.y,
                s: $p.s,
                d: d
            }, $ext, $hole, $arcd, $sz/100;

        }
        d += 360 / $ct;
    }
}