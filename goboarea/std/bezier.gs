# Module dealing with all your bezier stuffies
# https://pomax.github.io/bezierinfo/

%include std\\geo2d.gs

# --- Structs ---
struct CubBezier {
    x1, y1,
    x2, y2,
    x3, y3,
    x4, y4
}

# --- Quad Bezier ---
func bezier2(Pt2D p0, Pt2D p1, Pt2D p2, t) Pt2D {
    return Pt2D{
        x: (1 - $t) * ((1 - $t) * $p0.x + 2 * $t * $p1.x) + $t * $t * $p2.x,
        y: (1 - $t) * ((1 - $t) * $p0.y + 2 * $t * $p1.y) + $t * $t * $p2.y
    };
}

proc draw_bezier2 Pt2D p0, Pt2D p1, Pt2D p2, res {
    local i = 0;
    repeat $res + 1{
        goto_pt2d bezier2($p0, $p1, $p2, i);
        pen_down;
        i += 1 / $res;
    }
    pen_up;
}

# Bezier polygon base on https://scratch.mit.edu/projects/858037797
list Pt2D quad_bezier_polygon;
proc draw_bezier_poly t, res {
    local i = 1;
    repeat length quad_bezier_polygon {
        draw_bezier2 lerp_pt2ds(quad_bezier_polygon[j], quad_bezier_polygon[i], $t), 
                     quad_bezier_polygon[i], 
                     lerp_pt2ds(quad_bezier_polygon[i], quad_bezier_polygon[(i) % length quad_bezier_polygon + 1], $t), 
                     $res;
        j = i;
        i++;
    }    
}

# --- Cubic Bezier ---
func bezier3(Pt2D p0, Pt2D p1, Pt2D p2, Pt2D p3, t) Pt2D {
    return Pt2D{
        x: (1 - $t) * ((1 - $t) * ((1 - $t) * $p0.x + 3 * $t * $p1.x) + 3 * $t * $t * $p2.x) + $t * $t * $t * $p3.x,
        y: (1 - $t) * ((1 - $t) * ((1 - $t) * $p0.y + 3 * $t * $p1.y) + 3 * $t * $t * $p2.y) + $t * $t * $t * $p3.y
    };
}

proc draw_cubbez CubBezier bez, res {
    # https://scratch.mit.edu/projects/914063296/ with some changes
    local _1 = ($bez.x4 - (3 * ($bez.x3 - $bez.x2))) - $bez.x1;
    local _2 = 3 * ($bez.x1 + ($bez.x3 - $bez.x2 * 2));
    local _3 = 3 * ($bez.x2 - $bez.x1);
    local _4 = ($bez.y4 - (3 * ($bez.y3 - $bez.y2))) - $bez.y1;
    local _5 = 3 * ($bez.y1 + ($bez.y3 - $bez.y2 * 2));
    local _6 = 3 * ($bez.y2 - $bez.y1);

    local t = 0;
    repeat $res + 1{
        goto $bez.x1 + t * (_3 + t * (_2 + t * _1)),
             $bez.y1 + t * (_6 + t * (_5 + t * _4));
        pen_down;
        t += 1 / $res;
    }
    pen_up;
}

# --- Infinite bezier ---


# onflag {
#     forever {
#         erase_all;
#         draw_cubbez CubBezier{
#             x1: 0, y1: 0,
#             x2: mouse_x(), y2: mouse_y(),
#             x3: 100, y3: 0,
#             x4: 0, y4: 100
#         }, 20;
#     }
# }
