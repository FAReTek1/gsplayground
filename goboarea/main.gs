%include std\\pointengine.gs
%include std\\shapefill.gs

costumes "blank.svg";

onflag {
    hide;
    delete pts;

    # repeat 3 {
    #     add PE_Pt{x: random(-200, 200), y: random(-150, 150), col: "#FF0000"} to pts;
    # }
    add PE_Pt{x: 0, y: 0, col: "#FF0000"} to pts;
    add PE_Pt{x: 112, y: 119, col: "#FF0000"} to pts;
    add PE_Pt{x: -100, y: 0, col: "#FF0000"} to pts;

    forever {
        size_hack "Infinity";
        pointengine_control_tick;

        erase_all;

        Line2D l1 = line_by_idx(3, 1);
        Line2D l2 = line_by_idx(1, 2);

        th = 50;

        set_pen_color "#0000FF";
        set_pen_size th;
        draw_line l1;
        draw_line l2;

        set_pen_color "#00FF00";
        fill_miter l1, l2, th;

        
        size_hack "Infinity";
        pointengine_render;
    }
}