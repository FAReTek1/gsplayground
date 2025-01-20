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

# -- Ellipse --
# Based on https://scratch.mit.edu/projects/578538613 by @griefercube on scratch
proc fill_ellipse pos p, Stretch s, res {
    pen_up;
    if abs($s.w) == abs($s.h) {
        goto $p.x, $p.y;
        set_pen_size abs(2 * $p.s * $s.w);
        PEN_DU;
    } else {
        local w = abs($s.w * $p.s);
        local h = abs($s.h * $p.s);

        if h > w {
            local l = w;
        } else {
            local l = h;
        }

        local s = 2;
        repeat $res {
            s *= 2;
            if s > 360 {
                s = 360;
            }
            set_pen_size l;
            l /= 2;

            local d = 0;
            local rw = sqrt(1 - (l / w) * (l / w));
            local rh = sqrt(1 - (l / h) * (l / h));

            goto $p.x + cos($p.d) * (h * rw - l),
                 $p.y - sin($p.d) * (h * rw - l);
            pen_down;

            repeat s {
                d += 360 / s;
                goto $p.x + cos($p.d) * cos(d) * (h * rw - l)
                     + sin($p.d) * sin(d) * (w * rh - l),

                     $p.y + cos($p.d) * sin(d) * (w * rh - l)
                    - sin($p.d) * cos(d) * (h * rw - l);
            }
            pen_up;
            if 1 > l or s == 360 {
                stop_this_script;
            }
        }
    }
}

# -- Dynamic width line (defined by 2 circles) --
# Inspired by @chooper100 but no code adaption
# by faretek1
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

# Uses quad fill and tangent calcuation
# by faretek1
proc fill_dw_line_perfect Circle c1, Circle c2 {
    # Fill a dw line using a quad fill
    if $c1.r == $c2.r {
        goto $c1.x, $c1.y;
        set_pen_size $c1.r * 2;
        pen_down;
        goto $c2.x, $c2.y;
        pen_up;

    } elif $c2.r > $c1.r {
        fill_dw_line_perfect $c2, $c1;

    } else {
        local ir = ($c1.r - $c2.r);
        local PtX2 ps = get_tangent_points_of_circle_to_point(
            Circle{
                x: 0, 
                y: 0, 
                r: ir
            }, Pt2D{
                x: $c2.x - $c1.x,
                y: $c2.y - $c1.y
            });
        
        if ps.x1 == intersect_circle_error_codes.circinside {
            goto $c1.x, $c1.y;
            set_pen_size $c1.r * 2;
            pen_down;
            pen_up;

        } elif ps.x1 != intersect_circle_error_codes.notouch {
            ps.x1 /= ir;
            ps.y1 /= ir;
            ps.x2 /= ir;
            ps.y2 /= ir;

            goto $c1.x, $c1.y;
            set_pen_size $c1.r * 2;
            PEN_DU;

            goto $c2.x, $c2.y;
            set_pen_size $c2.r * 2;
            PEN_DU;

            fill_quad 
                Pt2D {
                    x: $c1.x + ($c1.r - 0.5) * ps.x1,
                    y: $c1.y + ($c1.r - 0.5) * ps.y1
                },
                Pt2D {
                    x: $c2.x + ($c2.r - 0.5) * ps.x1,
                    y: $c2.y + ($c2.r - 0.5) * ps.y1
                },
                Pt2D {
                    x: $c2.x + ($c2.r - 0.5) * ps.x2,
                    y: $c2.y + ($c2.r - 0.5) * ps.y2
                },
                Pt2D {
                    x: $c1.x + ($c1.r - 0.5) * ps.x2,
                    y: $c1.y + ($c1.r - 0.5) * ps.y2
                };
        }
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

# STLF by sockeye-d and faretek1 (not krypto)
# adapted from https://scratch.mit.edu/projects/1054272541/
# Costumes by sockeye-d
costumes "std\\stlf\\*.svg";

proc STLF Pt2D p1, Pt2D p2, th, style, cap {
    local dist = DIST($p1.x, $p1.y, $p2.x, $p2.y);
    if dist > $th {
        goto_pos_stretch pos{
            x: ($p1.x + $p2.x) / 2,
            y: ($p1.y + $p2.y) / 2,
            s: 100,
            d: DIR($p2.x, $p2.y, $p1.x, $p1.y)
        }, Stretch {
            w: dist - $th,
            h: $th
        };
        switch_costume $style;
        stamp;

        set_fisheye_effect 0;
        size_hack $th;
        switch_costume $cap;
        pos_hack $p1.x + 0.5 * $th * sin(direction()),
                 $p1.y + 0.5 * $th * cos(direction());
        stamp;

        pos_hack $p2.x - 0.5 * $th * sin(direction()),
                 $p2.y - 0.5 * $th * cos(direction());
        stamp;

    } else {
        goto_pos_stretch pos{
            x: ($p1.x + $p2.x) / 2,
            y: ($p1.y + $p2.y) / 2,
            s: 100,
            d: DIR($p2.x, $p2.y, $p1.x, $p1.y)
        }, Stretch {
            w: dist,
            h: $th
        };
        switch_costume $cap;
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

# -- Azex 3D adapted for quad by @ggenije(2) on scratch
# https://scratch.mit.edu/projects/882039002
proc fill_quad Pt2D p0, Pt2D p1, Pt2D p2, Pt2D p3 {
    # Since you can't have local vars across functions, I'm just using these very long-named global ones
    _shapefill_quad_fill_B = sqrt(($p2.x - $p0.x) * ($p2.x - $p0.x) + ($p2.y - $p0.y) * ($p2.y - $p0.y));
    _shapefill_quad_fill_A = sqrt(($p1.x - $p2.x) * ($p1.x - $p2.x) + ($p1.y - $p2.y) * ($p1.y - $p2.y));
    _shapefill_quad_fill_C = sqrt(($p1.x - $p0.x) * ($p1.x - $p0.x) + ($p1.y - $p0.y) * ($p1.y - $p0.y));
    _shapefill_quad_fill_P1 = _shapefill_quad_fill_A + (_shapefill_quad_fill_B + _shapefill_quad_fill_C);
    goto (_shapefill_quad_fill_A * $p0.x + _shapefill_quad_fill_B * $p1.x + _shapefill_quad_fill_C * $p2.x) / _shapefill_quad_fill_P1, (_shapefill_quad_fill_A * $p0.y + _shapefill_quad_fill_B * $p1.y + _shapefill_quad_fill_C * $p2.y) / _shapefill_quad_fill_P1;
    _shapefill_quad_fill_intern x_position() - $p0.x, y_position() - $p0.y, x_position() - $p1.x, y_position() - $p1.y, x_position() - $p2.x, y_position() - $p2.y, sqrt((_shapefill_quad_fill_P1 - _shapefill_quad_fill_A * 2) * (_shapefill_quad_fill_P1 - _shapefill_quad_fill_B * 2) * (_shapefill_quad_fill_P1 - _shapefill_quad_fill_C * 2) / _shapefill_quad_fill_P1), $p0.x, $p0.y, $p1.x, $p1.y, $p2.x, $p2.y;
    _shapefill_quad_fill_A = sqrt(($p3.x - $p2.x) * ($p3.x - $p2.x) + ($p3.y - $p2.y) * ($p3.y - $p2.y));
    _shapefill_quad_fill_C = sqrt(($p0.x - $p3.x) * ($p0.x - $p3.x) + ($p0.y - $p3.y) * ($p0.y - $p3.y));
    _shapefill_quad_fill_P1 = _shapefill_quad_fill_A + (_shapefill_quad_fill_B + _shapefill_quad_fill_C);
    goto (_shapefill_quad_fill_A * $p0.x + _shapefill_quad_fill_B * $p3.x + _shapefill_quad_fill_C * $p2.x) / _shapefill_quad_fill_P1, (_shapefill_quad_fill_A * $p0.y + _shapefill_quad_fill_B * $p3.y + _shapefill_quad_fill_C * $p2.y) / _shapefill_quad_fill_P1;
    _shapefill_quad_fill_intern x_position() - $p0.x, y_position() - $p0.y, x_position() - $p3.x, y_position() - $p3.y, x_position() - $p2.x, y_position() - $p2.y, sqrt((_shapefill_quad_fill_P1 - _shapefill_quad_fill_A * 2) * (_shapefill_quad_fill_P1 - _shapefill_quad_fill_B * 2) * (_shapefill_quad_fill_P1 - _shapefill_quad_fill_C * 2) / _shapefill_quad_fill_P1), $p0.x, $p0.y, $p3.x, $p3.y, $p2.x, $p2.y;
    set_pen_size 2;
    goto $p0.x, $p0.y;
    goto $p1.x, $p1.y;
    goto $p2.x, $p2.y;
    goto $p3.x, $p3.y;
    goto $p0.x, $p0.y;
    goto $p2.x, $p2.y;
    pen_up;
}

proc _shapefill_quad_fill_intern ina1, inb1, inc, ind, ine1, inf1, inr1, a, b, c, d, e, f {
    if _shapefill_quad_fill_A < _shapefill_quad_fill_B and _shapefill_quad_fill_A < _shapefill_quad_fill_C {
        _shapefill_quad_fill_A = 0.5 - $inr1 / (4 * sqrt($ina1 * $ina1 + $inb1 * $inb1));
    }
    elif _shapefill_quad_fill_B < _shapefill_quad_fill_C {
        _shapefill_quad_fill_A = 0.5 - $inr1 / (4 * sqrt($inc * $inc + $ind * $ind));
    }
    else {
        _shapefill_quad_fill_A = 0.5 - $inr1 / (4 * sqrt($ine1 * $ine1 + $inf1 * $inf1));
    }
    set_pen_size $inr1;
    pen_down;
    _shapefill_quad_fill_C = _shapefill_quad_fill_A;
    repeat -(ln($inr1) / ln(_shapefill_quad_fill_A)) {
        set_pen_size _shapefill_quad_fill_A * $inr1;
        goto $a + _shapefill_quad_fill_A * $ina1, $b + _shapefill_quad_fill_A * $inb1;
        goto $c + _shapefill_quad_fill_A * $inc, $d + _shapefill_quad_fill_A * $ind;
        goto $e + _shapefill_quad_fill_A * $ine1, $f + _shapefill_quad_fill_A * $inf1;
        goto $a + _shapefill_quad_fill_A * $ina1, $b + _shapefill_quad_fill_A * $inb1;
        _shapefill_quad_fill_A *= _shapefill_quad_fill_C;
    }
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

proc fill_shapefill_quad_fill_AW pos pos, hole {
    # Note: this filler is a bit stuttery and doesn't work sometimes
    if $hole < 0 {
        fill_shapefill_quad_fill_AW $pos, 0;

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

proc draw_shapefill_quad_fill_AW pos pos, hole {
    if $hole < 0 {
        _inner_shapefill_quad_fill_AW_draw $pos, 0, cos($pos.d), sin($pos.d), 
                       0.16 * $pos.s, 0.9 * $pos.s, 0;

    } elif $hole < 1 {
        _inner_shapefill_quad_fill_AW_draw $pos, $pos.s * $hole, cos($pos.d), sin($pos.d), 
                       0.16 * $pos.s, 0.9 * $pos.s, 0.9 * $pos.s * $hole;
    }
}

proc _inner_shapefill_quad_fill_AW_draw pos pos, s2, cosd, sind, rx, ry1, ry2 {
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

proc draw_arc_shapefill_quad_fill_CLE pos p, arcd, ext, hole, sz, ct, is_cw {
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

# -- STTF by @chrome_cat --
# (not tested)
struct STTFConsts {
    a, b, c, d, e
}
struct STTFBitmConsts {
    a, b, c, d, e, f, g
}

func STTF_gen_consts(S, R, h) STTFConsts {
    local p1x = 1 / sqrt(3) / $R;
    local p1y = -0.5 + $S / $R;
    local P1r = sqrt(p1x * p1x + p1y * p1y);
    local P2r = -1 * p1y - 1 / $R;

    return STTFConsts{
        a: p1y / (-2 * p1x),
        b: $h * $R * p1x / p1r / 100,
        c: 200 * ln(p2r / p1r),
        d: ln(2 * p1r) * 100,
        e: ln(2 * p2r) * 100
    };
}

func STTF_consts_rightangled(S, R, h) STTFBitmConsts {
    local P1x = 1 / (2 * $R);
    local P1y = -0.5 + $S / $R;
    local P1r = sqrt(P1x * P1x + P1y * P1y);
    local _PTy = 1 / $R + P1y;
    local P2r = P1r;
    
    local d = (180 * (P2y >= 0) - atan(P1x / P2y));

    return STTFBitmConsts{
        a: P1y / (-2 * P1x),
        b: $h * $R * P1x / P1r / 100,
        c: -d,
        d: d,
        e: 200 * ln(P2r / P1r),
        f: ln(2 * P1r) * 100,
        g: ln(2 * P2r) * 100
    };
}

proc STTF_inner P1_DOT_x, P1_DOT_y, P2_DOT_x, P2_DOT_y, _base, size {
    local f = -17.63348937376391 / ln(($P2_DOT_x * $P2_DOT_x + $P2_DOT_y * $P2_DOT_y) / ($P1_DOT_x * $P1_DOT_x + $P1_DOT_y * $P1_DOT_y));
    local x = -antiln(-28.65260025725912 / f); # real name: 1 - 2 * P1.r
    local w = ((180 * ($P2_DOT_y >= 0) - atan($P2_DOT_x / $P2_DOT_y) + $_base + 180) % 360 - 180) / (antiln(ln(-antiln(-37.46934494414107 / f)) * 2) - x * x);
    
    point_in_direction $_base + w * (x * x) + 90;
    
    set_fisheye_effect f - 100;
    set_whirl_effect w;
    
    switch_costume ($size / (-x) < 100) + 1;
    
    set_size $size / -x;
}

proc STTF x1, y1, x2, y2, x3, y3, tex {
    local a = ($x1 - $x3) * ($x1 - $x3) + ($y1 - $y3) * ($y1 - $y3);
    local b = ($x3 - $x2) * ($x3 - $x2) + ($y3 - $y2) * ($y3 - $y2);
    local c = ($x2 - $x1) * ($x2 - $x1) + ($y2 - $y1) * ($y2 - $y1);
    
    switch_costume "size0"; # size0 already exists, so use that instead
    set_size 1 / 0;

    if a > b and a > c {
        goto ($x1 + $x3) / 2 + 10.392304845413262 * ($y3 - $y1), ($y3 + $y1) / 2 - 10.392304845413262 * ($x3 - $x1);
        STTF_inner $x1 - x_position(), $y1 - y_position(), $x2 - x_position(), $y2 - y_position(), 180 * ($x3 >= $x1) - atan(($y3 - $y1) / ($x3 - $x1)), sqrt(a) / 0.24605149764209297;
        switch_costume $tex;
    
    } elif b > c {
        goto ($x3 + $x2) / 2 + 10.392304845413262 * ($y2 - $y3), ($y3 + $y2) / 2 - 10.392304845413262 * ($x2 - $x3);
        STTF_inner $x3 - x_position(), $y3 - y_position(), $x1 - x_position(), $y1 - y_position(), 180 * ($x2 >= $x3) - atan(($y2 - $y3) / ($x2 - $x3)), sqrt(b) / 0.24605149764209297;
        switch_costume $tex + 1;
    
    } else {
        goto ($x2 + $x1) / 2 + 10.392304845413262 * ($y1 - $y2), ($y2 + $y1) / 2 - 10.392304845413262 * ($x1 - $x2);
        STTF_inner $x2 - x_position(), $y2 - y_position(), $x3 - x_position(), $y3 - y_position(), 180 * ($x1 >= $x2) - atan(($y1 - $y2) / ($x1 - $x2)), sqrt(c) / 0.24605149764209297;
        switch_costume $tex + 2;
    }
    stamp;
}
# sttf bitmap
proc STTF_rightAngled_64_inner P1_DOT_x, P1_DOT_y, P2_DOT_x, P2_DOT_y, _base, size, _base_offset {
    local f = -17.369337557061655 / ln(($P2_DOT_x * $P2_DOT_x + $P2_DOT_y * $P2_DOT_y) / ($P1_DOT_x * $P1_DOT_x + $P1_DOT_y * $P1_DOT_y));
    local x = -antiln(-28.68147695456768 / f);
    local w = ((180 * ($P2_DOT_y >= 0) - atan($P2_DOT_x / $P2_DOT_y) + ($_base + $_base_offset) + 180) % 360 - 180) / (antiln(ln(-antiln(-37.3661457330985 / f)) * 2) - x * x);
    
    point_in_direction $_base + w * (x * x) + 90;

    set_fisheye_effect f - 100;
    set_whirl_effect w;

    switch_costume ($size / (-x) < 100) + 1;

    set_size $size / (-x);
}

proc STTF_rightAngled_64 x1, y1, x2, y2, x3, y3, tex {
    local a = ($x3 - $x1) * ($x3 - $x1) + ($y3 - $y1) * ($y3 - $y1);
    local b = ($x1 - $x2) * ($x1 - $x2) + ($y1 - $y2) * ($y1 - $y2);

    switch_costume "size0";
    set_size 1 / 0;

    if a > b {
        goto ($x1 + $x3) / 2 + 12 * ($y3 - $y1), ($y3 + $y1) / 2 - 12 * ($x3 - $x1);
        STTF_rightAngled_64_inner $x1 - x_position(), $y1 - y_position(), $x2 - x_position(), $y2 - y_position(), 180 * ($x3 >= $x1) - atan(($y3 - $y1) / ($x3 - $x1)), sqrt(a) / 0.42629677785273684, -2.6025622024998065;
        switch_costume $tex;
    } else {
        goto ($x1 + $x2) / 2 + 12 * ($y1 - $y2), ($y2 + $y1) / 2 - 12 * ($x1 - $x2);
        STTF_rightAngled_64_inner $x2 - x_position(), $y2 - y_position(), $x3 - x_position(), $y3 - y_position(), 180 * ($x1 >= $x2) - atan(($y1 - $y2) / ($x1 - $x2)), sqrt(b) / 0.42629677785273684, 2.6025622024998065;
        switch_costume $tex + 1;
    }
    stamp;
}

proc STTF_rightAngled_16 x1, y1, x2, y2, x3, y3, tex {
    local a = ($x3 - $x1) * ($x3 - $x1) + ($y3 - $y1) * ($y3 - $y1);
    local b = ($x1 - $x2) * ($x1 - $x2) + ($y1 - $y2) * ($y1 - $y2);
    switch_costume "size0";
    set_size 1 / 0;
    if a > b {
        goto ($x1 + $x3) / 2 + 24 * ($y3 - $y1), ($y3 + $y1) / 2 - 24 * ($x3 - $x1);
        STTF_rightAngled_16_inner $x1 - x_position(), $y1 - y_position(), $x2 - x_position(), $y2 - y_position(), 180 * ($x3 >= $x1) - atan(($y3 - $y1) / ($x3 - $x1)), sqrt(a) / 0.10664352605099862, -1.2453642667683473;
        switch_costume $tex;
    }
    else {
        goto ($x1 + $x2) / 2 + 24 * ($y1 - $y2), ($y2 + $y1) / 2 - 24 * ($x1 - $x2);
        STTF_rightAngled_16_inner $x2 - x_position(), $y2 - y_position(), $x3 - x_position(), $y3 - y_position(), 180 * ($x1 >= $x2) - atan(($y1 - $y2) / ($x1 - $x2)), sqrt(b) / 0.10664352605099862, 1.2453642667683473;
        switch_costume $tex + 1;
    }
    stamp;
}

proc STTF_rightAngled_16_inner P1_DOT_x, P1_DOT_y, P2_DOT_x, P2_DOT_y, _base, size, _base_offset {
    local f = -8.508068429588365 / ln(($P2_DOT_x * $P2_DOT_x + $P2_DOT_y * $P2_DOT_y) / ($P1_DOT_x * $P1_DOT_x + $P1_DOT_y * $P1_DOT_y));
    local x = -antiln(-28.746510564429745 / f);
    local w = ((180 * ($P2_DOT_y >= 0) - atan($P2_DOT_x / $P2_DOT_y) + ($_base + $_base_offset) + 180) % 360 - 180) / (antiln(ln(-antiln(-33.00054477922393 / f)) * 2) - x * x);
    
    point_in_direction $_base + w * (x * x) + 90;
    set_fisheye_effect f - 100;
    set_whirl_effect w;
    switch_costume ($size / (-x) < 100) + 1;
    set_size $size / (-x);
}