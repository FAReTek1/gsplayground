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

    say convert_base_dp(123.45, "0123456789", "01", 10); # mm yes 37 dont we love that number

    # forever {
    #     tick;
    # }
}

proc tick{
        size_hack "Infinity";
        pointengine_control_tick;

        erase_all;
        set_pen_color "#0000FF";
        i = 0;
        repeat 100 {
            goto_pt2d bezier3(pt2d_by_idx(1), pt2d_by_idx(2), pt2d_by_idx(3), pt2d_by_idx(4), i);
            pen_down;

            i += 0.01;
        }
        pen_up;
        
        size_hack "Infinity";
        pointengine_render;
}
