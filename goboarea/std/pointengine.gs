# a
# aa

%include std\\math.gs

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


proc pointengine_tick {
    local i = 1;
    local any_held = false;

    repeat length pts {
        local PE_Pt p = pts[i];

        set_pen_color p.col;
        set_pen_size pointengine_settings.pt_size;

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