%include std\\pointengine.gs
%include std\\bezier.gs
%include std\\spritecontrol.gs
%include std\\numgs.gs

costumes "blank.svg";

onflag {
    hide;
    delete pts;

    reset_pes;
    pointengine_settings.add_key = "space";
    pointengine_settings.remove_key = "x";

    repeat 4 {
        add PE_Pt{x: random(-200, 200), y: random(-150, 150), col: "#FF0000"} to pts;
    }

    forever {
        tick;
    }
}

proc tick{
        size_hack "Infinity";
        pointengine_control_tick;

        erase_all;
        set_pen_color "#0000FF";

        delete quad_bezier_polygon;
        i = 1;
        repeat length pts {
            add pt2d_by_idx(i) to quad_bezier_polygon;
            i++;
        }
        
        draw_bezier_poly 0.5, 100;
        
        size_hack "Infinity";
        pointengine_render;
}
