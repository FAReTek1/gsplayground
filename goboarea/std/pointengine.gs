# Pen engine for an easy to use point-demo

# %include std\\math.gs
%include std\\geo2d.gs

# Special pointengine points
struct PE_Pt {
    x, y, col
};

list PE_Pt pts;

struct _PES {
    pt_size, add_key, remove_key, add_col
}

proc reset_pes{
    # Edit attributes of pointengine_settings to modify pointengine behaviour
     _PES pointengine_settings = _PES{
        pt_size: 10,
        add_key: "",
        remove_key: "",
        add_col: "#FF0000"
     };
}


proc pointengine_control_tick {
    local i = 1;
    local any_held = false;

    if not(key_pressed(pointengine_settings.add_key)) and lf_add_btn_pressed {
        add PE_Pt{
            x: mouse_x(), y: mouse_y(), col: pointengine_settings.add_col
        } to pts;
    }
    # lf = last frame
    local lf_add_btn_pressed = key_pressed(pointengine_settings.add_key);



    repeat length pts {
        local PE_Pt p = pts[i];

        if DIST(p.x, p.y, _pointengine_old_mx, _pointengine_old_my) < pointengine_settings.pt_size / 2 {
            # Touching mouse
            if mouse_down() and not any_held {
                any_held = true;
                pts[i].x = mouse_x();
                pts[i].y = mouse_y();
            }

            if key_pressed(pointengine_settings.remove_key) {
                # pts[i].x = "NaN";
                # pts[i].y = "NaN";
                delete pts[i];
            }
        }

        i++;
    }

    _pointengine_old_mx = mouse_x();
    _pointengine_old_my = mouse_y();
}

proc pointengine_render {
    local i = 1;

    repeat length pts {
        local PE_Pt p = pts[i];
        set_pen_color p.col;
        set_pen_size pointengine_settings.pt_size;

        if DIST(p.x, p.y, mouse_x(), mouse_y()) < pointengine_settings.pt_size / 2 {
            # change_pen_brightness 25;
            # chenge_pen_saturation -50;
            if mouse_down() {
                # change_pen_brightness 25;
                # chenge_pen_saturation -50;
            }
        }

        goto p.x, p.y;
        pen_down; pen_up;

        i++;
    }
}

proc pointengine_tick {
    pointengine_control_tick;
    pointengine_render;
}

# Utilities for generating shapes from point indecies

func circle_by_idx(i1, i2) Circle {
    return Circle{
        x: (pts[$i1].x + pts[$i2].x) / 2,
        y: (pts[$i1].y + pts[$i2].y) / 2,
        r: DIST(pts[$i1].x, pts[$i1].y, pts[$i2].x, pts[$i2].y) / 2
    };
}

func pt2d_by_idx(i) Pt2D {
    return Pt2D{x: pts[$i].x, y: pts[$i].y};
}

func line_by_idx(i1, i2) Line2D {
    return Line2D{
        x1: pts[$i1].x,
        y1: pts[$i1].y,
        x2: pts[$i2].x,
        y2: pts[$i2].y
    };
}

func pos_by_idx(i1, i2) pos {
    return pos{
        x: pts[$i1].x,
        y: pts[$i1].y,
        s: DIST(pts[$i1].x, pts[$i1].y, pts[$i2].x, pts[$i2].y),
        d: DIR(pts[$i2].x, pts[$i2].y, pts[$i1].x, pts[$i1].y)
    };
}