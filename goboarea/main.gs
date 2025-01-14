%include std\\pointengine.gs
%include std\\shapefill.gs

costumes "blank.svg";

onflag {
    hide;
    delete pts;

    # repeat 3 {
    #     add PE_Pt{x: random(-200, 200), y: random(-150, 150), col: "#FF0000"} to pts;
    # }
    add PE_Pt{x: 79, y: -50, col: "#FF0000"} to pts; # 0. 0
    add PE_Pt{x: 23, y: -73, col: "#FF0000"} to pts; # 112, 119
    add PE_Pt{x: -100, y: 0, col: "#FF0000"} to pts; # -100, 0

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
        fill_miter_arc l1, l2, th;

        
        size_hack "Infinity";
        pointengine_render;
    }
}