%include std\\pointengine.gs
%include std\\bezier.gs
%include std\\spritecontrol.gs
%include std\\color.gs
%include std\\shapefill.gs

costumes "blank.svg", "circle.svg";

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
        erase_all;
        pointengine_control_tick;
        size_hack "Infinity";

        set_pen_color "#0000FF";
        fill_quad pt2d_by_idx(1), pt2d_by_idx(2), pt2d_by_idx(3), pt2d_by_idx(4);
        
        size_hack "Infinity";
        pointengine_render;

}
