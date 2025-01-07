# Geo2D by faretek1
# This should later use std/vec since that will allow for more integration with the std

# %include std\\bitw.gs
%include std\\math.gs
%include std\\azex.gs

# -- Macros ---
# These should probably be added to other things - e.g. math.gs
%define LERP(A,B,T) A + (B - A) * T
%define INVLERP(VAL,A,B) (VAL - A) / (B - A)

# Get distance but don't square root it
%define DISTSQUARED(X1,Y1,X2,Y2) ((X2)-(X1))*((X2)-(X1))+((Y2)-(Y1))*((Y2)-(Y1))

# --- Structs ---

struct Pt2D{
    x, y
}

struct Line2D{
    # Ideally this would be p1, p2, but I can't put structs in structs
    # If x1 is NaN (ignore the rest), then don't draw the line
    x1, y1, 
    x2, y2
}

struct MxPlusC {
    # Form of a line using y = mx + c.
    # If the line is vertical, m = "NaN" & c = the x position of the line

    # Using a struct to represent this since it's the only way afaik that you can return multiple values from a function
    m, c
}

struct Circle {
    x, y, r
}

# - Structs for returning values -
struct PtX2{
    x1, y1, x2, y2
}

func get_ptx2(PtX2 pts, index) Pt2D {
    if index == 1 {
        return Pt2D{
            x: $pts.x1,
            y: $pts.y1
        };
    } else {
        return Pt2D{
            x: $pts.x2,
            y: $pts.y2
        };
    }
}

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

# -- Pt2D ---

func join_pt2Ds(Pt2D p1, Pt2D p2) Line2D {
    return Line2D {
        x1: $p1.x, y1: $p1.y,
        x2: $p2.x, y2: $p2.y
    };
}

func mouse_pt() Pt2D {
    return Pt2D{
        x: mouse_x(),
        y: mouse_y()
    };
}

proc goto_pt2d Pt2D pos {
    goto $pos.x, $pos.y;
}

# --- Line2D ---
proc draw_line Line2D l {
    # We only check x1
    if $l.x1 != "NaN"{
        goto $l.x1, $l.y1;
        pen_down;
        goto $l.x2, $l.y2;
        pen_up;
    }
}

func intersect_l2d(Line2D l1, Line2D l2) Pt2D {
    local denom = ($l1.x1 - $l1.x2) * ($l2.y1 - $l2.y2) - ($l1.y1 - $l1.y2) * ($l2.x1 - $l2.x2);

    return Pt2D {
        x: (($l1.x1 * $l1.y2 - $l1.y1 * $l1.x2) * ($l2.x1 - $l2.x2) - ($l1.x1 - $l1.x2) * ($l2.x1 * $l2.y2 - $l2.y1 * $l2.x2)) / denom,
        y: (($l1.x1 * $l1.y2 - $l1.y1 * $l1.x2) * ($l2.y1 - $l2.y2) - ($l1.y1 - $l1.y2) * ($l2.x1 * $l2.y2 - $l2.y1 * $l2.x2)) / denom
    };
}

func l2d_to_mxc(Line2D l) MxPlusC {
    if $l.x1 == $l.x2 {
        # Vertical line
        return MxPlusC {
            m: "NaN", c: $l.x1
        };

    } else {
        local m = ($l.y2 - $l.y1) / ($l.x2 - $l.x1);

        return MxPlusC {
            m: m,
            c: $l.y1 - $l.x1 * m
        };
    }
}

# --- Circle ---
proc fill_circle Circle c {
    # literally paint a dot
    goto $c.x, $c.y;
    set_pen_size 2 * $c.r;
    pen_down;
    pen_up;
}

func circle_at (Pt2D p, r) Circle {
    return Circle{
        x: $p.x, y:$p.y, r: $r
    };
}

func intersect_circles(Circle c1, Circle c2) PtX2 {
    # i1 & i2
    local dx = $c2.x - $c1.x;
    local dy = $c2.y - $c1.y;

    # i3
    local disquared = dx * dx + dy * dy;
    local dist = sqrt(disquared);

    if dist > $c1.r + $c2.r {
        return PtX2{x1: "notouch", x2: "notouch"};
    }

    if dist < abs($c1.r - $c2.r) {
        return PtX2{x1: "circinside", x2: "circinside"};
    }
    
    # i1 & i2
    local vx = dx / dist;
    local vy = dy / dist;

    # This is old code, idk what to call this :\ I think it's some kind of magnitude to multiply by unit vector
    # i6
    local m1 = ((($c1.r * $c1.r) - ($c2.r * $c2.r)) + disquared) / (2 * dist);

    # i7 & i8
    local mdx = $c1.x + m1 * vx;
    local mdy = $c1.y + m1 * vy;

    # i9
    local m2 = sqrt(($c1.r * $c1.r) - (m1 * m1)); # Putting a lot of brackets because goboscript seems to have BIDMAS errors

    # i10 & i11
    local ox = m2 * vx;
    local oy = m2 * vy;

    return PtX2{
        x1: mdx + oy,
        y1: mdy - ox,
        x2: mdx - oy,
        y2: mdy + ox
    };

}

# --- mx + c ---
func get_mxc_at_x(MxPlusC eq, x) {
    return $x * $eq.m + $eq.c; 
}

# - Cohen-Sutherland line clipper

struct Box {
    # Struct representing a rectangle bounded by x/y min & max values
    xmin, ymin, xmax, ymax
}

proc draw_box Box b {
    goto $b.xmin, $b.ymin; pen_down;

    goto $b.xmin, $b.ymax;
    goto $b.xmax, $b.ymax;
    goto $b.xmax, $b.ymin;

    goto $b.xmin, $b.ymin; pen_up;
}

func _compute_out_code(x, y, Box b) {
    return 
    "" + ($y > $b.ymax) & 
    "" + ($y < $b.ymin) &
    "" + ($x > $b.xmax) &
    "" + ($x < $b.xmin);
}

func cohen_sutherland (Line2D l, Box b) Line2D {
    # Adapted from https://en.wikipedia.org/wiki/Cohen%E2%80%93Sutherland_algorithm

    local outcode1 = _compute_out_code($l.x1, $l.y1, $b);
    local outcode2 = _compute_out_code($l.x2, $l.y2, $b);

    local Line2D l = $l; # So that it's mutable

    forever {
        if (outcode1 == "0000") and (outcode2 == "0000") {
            return l;

        } elif "2" in (outcode1 + outcode2) {
            # Line is defintely outside of clip window
            return Line2D{x1: "NaN"};

        } else {
            # Can't use the MAX function because it removes the starting 0s
            if outcode1 > outcode2 {
                local outcode_out = outcode1;
            } else {
                local outcode_out = outcode2;
            }

            # Clip the line
            # The following code actually contains a lot of lerps
            if outcode_out[1]{
                # Point is above clip window
                local x =  l.x1 + (l.x2 - l.x1) * ($b.ymax - l.y1) / (l.y2 - l.y1);
                local y = $b.ymax;
            } elif outcode_out[2]{
                # Point is below clip window
                local x =  l.x1 + (l.x2 - l.x1) * ($b.ymin - l.y1) / (l.y2 - l.y1);
                local y = $b.ymin;
            } elif outcode_out[3] {
                # Point is to the right of clip window
                local y = l.y1 + (l.y2 - l.y1) * ($b.xmax - l.x1) / (l.x2 - l.x1);
                local x = $b.xmax;
            } else {
                # Point is to the left of clip window

                # We can use an else instead of another elif,
                # since we know the outcode isn't 0000, otherwise
                # it would have been caught at the top
                
                local y = l.y1 + (l.y2 - l.y1) * ($b.xmin - l.x1) / (l.x2 - l.x1);
                local x = $b.xmin;
            }

            if outcode_out == outcode1 {
                l.x1 = x;
                l.y1 = y;
                outcode1 = _compute_out_code(x, y, $b);
            } else {
                l.x2 = x;
                l.y2 = y;
                outcode2 = _compute_out_code(x, y, $b);
            }
        }
    }
}

# - Circle-line clipper -
func circle_line_clip (Circle c, Line2D l) Line2D {
    # (Probably optimisable) circle-line clipper algorithm by faretek1
    local d1 = DIST($l.x1, $l.y1, $c.x, $c.y);
    local d2 = DIST($l.x2, $l.y2, $c.x, $c.y);

    local Line2D ret = $l; # Just copy over contents. We'll probably override this but oh well

    if d1 <= $c.r  and d2 <= $c.r {
        return ret;
    }

    if $l.x1 == $l.x2 {
        local dx = $l.x1 - $c.x;
        local discrim = sqrt(4 * ($c.r * $c.r - dx * dx));

        if d1 > $c.r {
            if $l.y1 > $l.y2 {
                ret.y1 = (2 * $c.y + discrim) / 2;
            } else {
                ret.y1 = (2 * $c.y - discrim) / 2;
            }

        } 
        if d2 > $c.r {
           if $l.y1 > $l.y2 {
                ret.y2 = (2 * $c.y - discrim) / 2;
            } else {
                ret.y2 = (2 * $c.y + discrim) / 2;
            }
        }

        local t1 = INVLERP(ret.y1, $l.y1, $l.y2);
        local t2 = INVLERP(ret.y2, $l.y1, $l.y2);

        if DISTSQUARED($c.x, $c.y, ret.x1, ret.y1) > $c.r * $c.r {
            ret.x1 = "NaN";
        }

    } else {
        local MxPlusC l_eq = l2d_to_mxc($l);

        # The following are a, b & c for use with quadratic formula
        local a = 1 + l_eq.m * l_eq.m;
        local b = 2 * (l_eq.m * (l_eq.c - $c.y) - $c.x);
        local c = $c.x * $c.x + (l_eq.c * l_eq.c - ($c.y * (2 * l_eq.c - $c.y))) - $c.r * $c.r; 
        # The brackets were required to prevent goboscript from bracketifying it wrongly

        local discrim = b * b - 4 * a * c;

        if discrim < 0 {
            return Line2D{x1: "NaN"};
        }

        discrim = sqrt(discrim);
        if d1 > $c.r and d2 > $c.r {
        ret.x1 = (b + discrim) / (-2 * a);
        ret.y1 = get_mxc_at_x(l_eq, ret.x1);
        
        ret.x2 = (discrim - b) / (2 * a);
        ret.y2 = get_mxc_at_x(l_eq, ret.x2);
        } else {

        # 1 in, 1 out
        local x1 = (b + discrim) / (-2 * a);
        local x2 = (discrim - b ) / (2 * a);

        local t1 = INVLERP(x1, $l.x1, $l.x2);
        local t2 = INVLERP(x2, $l.x1, $l.x2);

        if d1 > $c.r {
            if t1 < t2 {
                ret.x1 = x1;
                ret.y1 = get_mxc_at_x(l_eq, ret.x1);
            } else {
                ret.x1 = x2;
                ret.y1 = get_mxc_at_x(l_eq, ret.x1);
            }
        } else {
            # This is when d2 > $c.r. we can assume this because not both can be more than $c.r,
            # otherwise we get the above case, and not both can be within, otherwise we get the top case
            if t1 < t2 {
                ret.x2 = x2;
                ret.y2 = get_mxc_at_x(l_eq, ret.x2);
            } else {
                ret.x2 = x1;
                ret.y2 = get_mxc_at_x(l_eq, ret.x2);
            }
        }
        }

        local t1 = INVLERP(ret.x1, $l.x1, $l.x2);
        local t2 = INVLERP(ret.x2, $l.x1, $l.x2);
    }
    
    if t1 < 0 or t2 < 0 or t1 > 1 or t2 > 1 {
        # The return must be in bounds of the line
        ret.x1 = "NaN";
    }

    return ret;
}

# - Cyrus-Beck algorithm -
list Pt2D cyrus_beck_shape;
# List containing vertices of the clipping window (must be convex and anti-clockwise)
# This is meant to be anti-clockwise, not clockwise

proc add_cybck_point Pt2D p {
    add $p to cyrus_beck_shape;
}

proc gen_cybck_regply side, r, dir{
    delete cyrus_beck_shape;
    local angle = $dir;

    repeat $side {
        add_cybck_point Pt2D{
            x: $r * sin(angle),
            y: $r * cos(angle)
        };

        angle -= 360 / $side;
    }
}

proc draw_cybck_shape {
    local i = 1;
    repeat length cyrus_beck_shape {
        goto_pt2d cyrus_beck_shape[i];
        pen_down;

        i ++;
    }

    goto_pt2d cyrus_beck_shape[1];

    pen_up;
}

func clip_cybeck (Line2D l) Line2D {
    # Based on https://www.geeksforgeeks.org/line-clipping-set-2-cyrus-beck-algorithm/

    local n = length cyrus_beck_shape;
    local i = 1;

    local dx = $l.x2 - $l.x1;
    local dy = $l.y2 - $l.y1;
    
    local tmin = 0;
    local tmax = "Infinity";
    

    repeat n {
        local Pt2D p = cyrus_beck_shape[i];

        # Calculate normals
        local nx = cyrus_beck_shape[i].y - cyrus_beck_shape[i % n + 1].y;
        local ny = cyrus_beck_shape[i % n + 1].x - cyrus_beck_shape[i].x;

        # P0 - PEi is only needed once so we calculate it here in Vector 2
        # This is used to calculate the numerator and denominator with a dot product
        local P0_PEi = nx * dx + ny * dy;

        # You don't need to store these values so just compare them to temps immediately
        # Bugfix for vertical and horizontal lines by Chris Crowe https://discuss.geeksforgeeks.org/comment/4808826060
        local num = nx * (p.x - $l.x1) + ny * (p.y - $l.y1);
        local den = (P0_PEi == 0) + P0_PEi * (P0_PEi != 0);

        local t = num / den;

        if P0_PEi < 0 {
            if t < tmax {
                tmax = t;
            }

        } else {
            if t > tmin {
                tmin = t;
            }
        }

        i ++;
    }

    # Line not touching shape
    # Second part of the or for making sure that it does not continue the line on 1 side
    if tmin > tmax or (tmin > 1 and tmax > 1) {
        return Line2D{x1: "NaN"};
    }

    # Clip line if the point is further than the edge, otherwise set to clipped point
    local Line2D ret = Line2D{
        x1: $l.x2, # All default to p2
        y1: $l.y2, # All default to p2
        x2: $l.x2, # All default to p2
        y2: $l.y2  # All default to p2
    };
    
    if tmin < 1 {
        ret.x1 = $l.x1 + dx * tmin;
        ret.y1 = $l.y1 + dy * tmin;
    }
    if tmax < 1 {
        ret.x2 = $l.x1 + dx * tmax;
        ret.y2 = $l.y1 + dy * tmax;
    }

    return ret;
}

# - Sutherland-Hodgman algorithm -
# Based on https://www.geeksforgeeks.org/polygon-clipping-sutherland-hodgman-algorithm/

list Pt2D slhd_clip_poly;
list Pt2D slhd_poly_points;
# These are meant to be clockwise, not anti-clockwise
list Pt2D slhd_new_poly;

proc add_slhd_clip_point Pt2D p {
    add $p to slhd_clip_poly;
}

proc gen_slhd_clip_regply side, r, dir{
    delete slhd_clip_poly;
    local angle = $dir;

    repeat $side {
        add_slhd_clip_point Pt2D{
            x: $r * sin(angle),
            y: $r * cos(angle)
        };

        angle += 360 / $side;
    }
}
proc add_slhd_poly_point Pt2D p {
    add $p to slhd_poly_points;
}

proc _slhd_clip Line2D l{
    delete slhd_new_poly;

    local new_poly_size = 0;
    local poly_size = length slhd_poly_points;

    # (ix,iy),(kx,ky) are the co-ordinate values of the points
    local i = 1;
    repeat poly_size {
        # i and k form a line in polygon
        local k = i % poly_size + 1;

        local Pt2D ip = slhd_poly_points[i]; # really is pt #i
        local Pt2D kp = slhd_poly_points[k];

        # Calculating position of first point with regards to the clipper line
        local i_pos = ($l.x2 - $l.x1) * (ip.y - $l.y1) - ($l.y2 - $l.y1) * (ip.x - $l.x1);
        # Calculating position of second point w.r.t. clipper line
        local k_pos = ($l.x2 - $l.x1) * (kp.y - $l.y1) - ($l.y2 - $l.y1) * (kp.x - $l.x1);

        # Case 1 : When both points are inside
        if i_pos < 0 and k_pos < 0 {
            # Only second point is added
            add kp to slhd_new_poly;
            new_poly_size ++;
        } 

        # Case 2: When only first point is outside
        elif i_pos >= 0 and k_pos < 0 {
            # Point of intersection with edge and the second point is added
            add intersect_l2d($l, join_pt2Ds(ip, kp)) to slhd_new_poly;
            add kp to slhd_new_poly;
            new_poly_size += 2;
        }

        # Case 3: When only second point is outside
        elif i_pos < 0 and k_pos >= 0 {
            # Only point of intersection with edge is added
            add intersect_l2d($l, join_pt2Ds(ip, kp)) to slhd_new_poly;
            new_poly_size ++;
        } else {
            # Case 4: When both points are outside
            # No points are added
        }
        i ++;
    }

    # Copying new points into original array and changing the # of vertices
    poly_size = new_poly_size;
    delete slhd_poly_points;
    local i = 1;  # i is used earlier so we don't **need** to say local

    repeat poly_size {
        add slhd_new_poly[i] to slhd_poly_points;
        i ++;
    }
}

proc clip_slhd {
    # Input and output are actually lists, so this is a procedure with no args!
    local poly_size = length slhd_poly_points;
    local clip_size = length slhd_clip_poly;

    # i and k are two consecutive indexes
    local i = 1;
    repeat clip_size {
        local k = i % clip_size + 1;

        # We pass the current array of vertices, it's size and the end points of the selected clipper line
        _slhd_clip join_pt2Ds(slhd_clip_poly[i], slhd_clip_poly[k]);

        i ++;
    }
}

# %define TRIFILL_PLIST(plist) \ # There's not enough macro support to do this *yet*, since i cant use a repeat loop
#     say plist[0].x; \
#     say length plist; \
#     __TRIFILL_PLIST__i = 1; \# local keyword doesn't seem to work here???

    # repeat length plist - 2{\
    #     fillTri plist[1].x, plist[1].y, 
    #     plist[__TRIFILL_PLIST__i].x, plist[__TRIFILL_PLIST__i].y, 
    #     plist[__TRIFILL_PLIST__i + 1].x, plist[__TRIFILL_PLIST__i + 1].y; \
    #     i ++; \
    # }