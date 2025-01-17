%include std\\pointengine.gs
%include std\\shapefill.gs

costumes "blank.svg";

onflag {
    hide;
    delete pts;

    reset_pes;
    pointengine_settings.add_key = "space";
    pointengine_settings.remove_key = "x";

    repeat 2 {
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
        fill_regply pos_by_idx(1, 2), 6, 2;
        
        size_hack "Infinity";
        pointengine_render;
}
