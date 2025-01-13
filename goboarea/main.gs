%include std\\pointengine.gs
%include std\\shapefill.gs

costumes "blank.svg";

onflag {
    hide;
    delete pts;

    repeat 4 {
        add PE_Pt{x: random(-200, 200), y: random(-150, 150), col: "#FF0000"} to pts;
    }

    forever {
        size_hack "Infinity";

        erase_all;
        pointengine_control_tick;
        
        Circle c1 =circle_by_idx(1, 2);
        Circle c2 =circle_by_idx(3, 4);

        set_pen_size 3;

        set_pen_color "#0000FF";
        draw_circle c1, 30;
        set_pen_color "#FFFFFF";
        draw_circle c2, 30;

        set_pen_color "#00FF00";
        PtX2 ret = intersect_circles(c1, c2);
        draw_ptx2 ret;
        
        draw_crescent c1, c2, 30;

        pointengine_render;
    }
}