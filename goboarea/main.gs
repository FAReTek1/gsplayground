%include std\\pointengine.gs
%include std\\shapefill.gs

costumes "blank.svg";

onflag {
    hide;
    delete pts;

    repeat 4 {
        add PE_Pt{x: random(-200, 200), y: random(-150, 150), col: "#FF0000"} to pts;
    }

    set_size "Infinity";
    forever {
        erase_all;

        pointengine_control_tick;
        
        set_pen_color "#0000FF";
        fill_circle circle_by_idx(1, 2);

        set_pen_color "#0000AA";
        fill_circle circle_by_idx(3, 4);

        pointengine_render;

    }
}