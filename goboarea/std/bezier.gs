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

proc draw_cubbez Pt2D p1, Pt2D p2, Pt2D p3, Pt2D p4, res {
    # https://scratch.mit.edu/projects/914063296/ with some changes
    local _1 = ($p4.x - (3 * ($p3.x - $p2.x))) - $p1.x;
    local _2 = 3 * ($p1.x + ($p3.x - $p2.x * 2));
    local _3 = 3 * ($p2.x - $p1.x);
    local _4 = ($p4.y - (3 * ($p3.y - $p2.y))) - $p1.y;
    local _5 = 3 * ($p1.y + ($p3.y - $p2.y * 2));
    local _6 = 3 * ($p2.y - $p1.y);

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
# De Casteljau's algorithm
list Pt2D de_casteljau_pts;
list Pt2D _get_casteljau;
func get_casteljau(t) Pt2D {
    delete _get_casteljau;
    local i = 1;
    repeat length de_casteljau_pts {
        add de_casteljau_pts[i] to _get_casteljau;
        i++;
    }

    local l = "";
    until l == 2 {
        l = length _get_casteljau;

        repeat length _get_casteljau - 1 {
            add lerp_pt2ds(_get_casteljau[1], _get_casteljau[2], $t) to _get_casteljau;
            delete _get_casteljau[1];
        }
        delete _get_casteljau[1];
    }
    return _get_casteljau[1];
}
