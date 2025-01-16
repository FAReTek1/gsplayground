%include std\\pointengine.gs
%include std\\shapefill.gs

costumes "blank.svg";

onflag {
    hide;
    delete pts;

    reset_pes;
    pointengine_settings.add_key = "space";
    pointengine_settings.remove_key = "x";

    # repeat 2 + 3 {
    #     add PE_Pt{x: random(-200, 200), y: random(-150, 150), col: "#FF0000"} to pts;
    # }

    add PE_Pt{x: 189, y: 4, col: "#FF0000"} to pts;
    add PE_Pt{x: -110, y: 8, col: "#FF0000"} to pts;
    add PE_Pt{x: 87, y: -72, col: "#FF0000"} to pts;
    add PE_Pt{x: -131, y: -52, col: "#FF0000"} to pts;
    add PE_Pt{x: -189, y: 145, col: "#FF0000"} to pts;


    forever {
        tick;
        # say cnc_ngon;
        stop_this_script;
    }
}

proc tick{
        size_hack "Infinity";
        pointengine_control_tick;

        erase_all;

        Circle c = circle_by_idx(1, 2);
        set_pen_color RGBA(255, 255, 255, 20);
        fill_circle c;

        delete cnc_ngon;

        i = 3;
        set_pen_size 1;
        set_pen_color "#FF0000";
        repeat length pts - 2 {
            PE_Pt p = pts[i];
            goto p.x, p.y;
            pen_down;

            add Pt2D{
                x: p.x, y: p.y
            } to cnc_ngon;

            i++;
        }
        goto pts[3].x, pts[3].y;
        pen_up;

        circle_ngon_clip c;
        render_cnc;
        
        size_hack "Infinity";
        pointengine_render;
}