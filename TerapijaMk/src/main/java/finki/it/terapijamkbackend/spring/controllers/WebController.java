package finki.it.terapijamkbackend.spring.controllers;

import finki.it.terapijamkbackend.spring.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;


@Controller
public class WebController {
    @GetMapping(path="/")
    public String index() {
        return "html/index";
    }

    @GetMapping(path="/editUser.html")
    public String user() {
        return "html/editUser";
    }

    @GetMapping(path="/calendar.html")
    public String calendar() {
        return "html/calendar";
    }

    @GetMapping(path="/terms.html")
    public String terms() {
        return "html/terms";
    }

    @GetMapping(path="/admin.html")
    public String admin() {
        return "html/admin";
    }

    @GetMapping(path="/admin-terms.html")
    public String adminTerms() {
        return "html/admin-terms";
    }

    @GetMapping(path="/users-view.html")
    public String usersView() {
        return "html/users-view";
    }

    @GetMapping(path="/adminNews.html")
    public String adminNews() {
        return "html/adminNews";
    }

    @GetMapping(path="/adminCoupons.html")
    public String adminCoupons() {
        return "html/adminCoupons";
    }

    @GetMapping(path="/userInfo.html")
    public String userInfo() {
        return "html/userInfo";
    }
}
