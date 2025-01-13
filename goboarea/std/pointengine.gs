# Pen engine for an easy to use point-demo

# %include std\\math.gs
%include std\\geo2d.gs

# Special pointengine points
struct PE_Pt {
    x, y, col
};

list PE_Pt pts;

struct _PES {
    pt_size
}

onflag {
    # Edit attributes of pointengine_settings to modify pointengine behaviour
     _PES pointengine_settings = _PES{
        pt_size: 10
     };
}


proc pointengine_control_tick {
    
    local i = 1;
    local any_held = false;

    repeat length pts {
        local PE_Pt p = pts[i];

        if DIST(p.x, p.y, _pointengine_old_mx, _pointengine_old_my) < pointengine_settings.pt_size / 2 {
            # Touching mouse
            if mouse_down() and not any_held {
                any_held = true;
                pts[i].x = mouse_x();
                pts[i].y = mouse_y();
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

func circle_by_idx(i1, i2) Circle {
    return Circle{
        x: (pts[$i1].x + pts[$i2].x) / 2,
        y: (pts[$i1].y + pts[$i2].y) / 2,
        r: DIST(pts[$i1].x, pts[$i1].y, pts[$i2].x, pts[$i2].y) / 2
    };
}