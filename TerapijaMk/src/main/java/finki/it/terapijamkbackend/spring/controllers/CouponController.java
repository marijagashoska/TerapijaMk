package finki.it.terapijamkbackend.spring.controllers;
import finki.it.terapijamkbackend.spring.entities.Coupon;
import finki.it.terapijamkbackend.spring.services.CouponsService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/coupons")
public class CouponController {
    @Autowired
    private CouponsService couponService;

    @PutMapping("/createCoupon")
    public ResponseEntity<Coupon> updateCoupon(@RequestBody Coupon couponItem) {
        if (couponItem.getTitle() == null || couponItem.getCode() == null) {
            return ResponseEntity.badRequest().build();
        }
        Coupon createdCoupon = couponService.saveCoupon(couponItem);
        return ResponseEntity.ok(createdCoupon);
    }
    @GetMapping("/getAllCoupons")
    public ResponseEntity<List<Coupon>>getAllCoupons(){
        List<Coupon> couponList=couponService.getAllCoupons();
        return ResponseEntity.ok(couponList);
    }
    @DeleteMapping("/deleteCoupon")
    public ResponseEntity<?>deleteEntity(@RequestParam String userId){
        try{
            couponService.deleteById(userId);
            return ResponseEntity.ok().build();
        }
        catch(EntityNotFoundException e){
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/editCoupon")
    public ResponseEntity<Void> editCoupon(@RequestParam String identifier, @RequestBody Coupon newCouponData) {
        Optional<Coupon> couponOptional = couponService.findByIdentifier(identifier);
        if (couponOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        Coupon coupon = couponOptional.get();
        coupon.setTitle(newCouponData.getTitle());
        coupon.setCode(newCouponData.getCode());
        coupon.setDescription(newCouponData.getDescription());
        couponService.save(coupon);

        return ResponseEntity.ok().build();
    }


    @GetMapping("/getCouponNames")
    public ResponseEntity<List<String>> getCouponNames() {
        List<String> couponNames = couponService.getCouponNames();
        return ResponseEntity.ok(couponNames);
    }
}
