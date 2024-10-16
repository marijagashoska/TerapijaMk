package finki.it.terapijamkbackend.spring.services;

import finki.it.terapijamkbackend.spring.dto.CarriedOutInfo;
import finki.it.terapijamkbackend.spring.entities.User;
import finki.it.terapijamkbackend.spring.exception.UserNotFoundException;
import finki.it.terapijamkbackend.spring.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    public void createUser(String name, String surname, String username, String password, String age, String phone) {
        User user = new User(name, surname, username, password, age, phone);
        userRepository.save(user);
    }
    public boolean userExists(String username) {
        return userRepository.existsByUsername(username);
    }

    public boolean doesExist(String username,String password){
       User user=userRepository.findByUsername(username).orElse(null);
       if(user!=null){
          return user.getPassword().equals(password);
       }
       else return false;
    }
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username).orElse(null);
    }
    public User getUserById(Long userId) {
        return userRepository.findById(userId).orElse(null);
    }
    public User updateUser(String username, User updatedUser) throws UserNotFoundException {
        Optional<User> existingUserOpt = userRepository.findByUsername(username);

        if (existingUserOpt.isPresent()) {
            User existingUser = existingUserOpt.get();
            existingUser.setName(updatedUser.getName());
            existingUser.setSurname(updatedUser.getSurname());
            existingUser.setPhone(updatedUser.getPhone());
            existingUser.setDateBirth(updatedUser.getDateBirth());


            if (!existingUser.getUsername().equals(updatedUser.getUsername())) {
                if (userRepository.existsByUsername(updatedUser.getUsername())) {
                    throw new UserNotFoundException("Username already taken");
                }
                existingUser.setUsername(updatedUser.getUsername());
            }

            return userRepository.save(existingUser);
        } else {
            throw new UserNotFoundException("User not found with username: " + username);
        }
    }

    public boolean updateUserTermList(User user,String term,String additionalInfo,String status){
        user.setAppointmentTerms(term,additionalInfo,status);
        userRepository.save(user);
        return true;
    }
    public boolean updateUserCarriedOutList(User user,String term,String additionalInfo,String status,String note){
        user.setCarriedOut(term,additionalInfo,note,status);
        userRepository.save(user);
        return true;
    }
    public List<User> getUsersByFilter(String parameter,String filter){
        if(parameter.equals("status")){
            switch(filter){
                case "all":
                    return userRepository.findAll();
                case "active":
                    return userRepository.findActive();
                case "blocked":
                    return userRepository.findBlocked();
            }
        }
        else{
            switch(parameter){
                case "name":
                    return userRepository.findByName(filter);
                case "surname":
                    return userRepository.findBySurname(filter);
                case "username":
                    Optional opt=userRepository.findByUsername(filter);
                    if(opt.isPresent()){
                        User tempUser= (User) opt.get();
                        List<User>temp= new ArrayList<>();
                        temp.add(tempUser);
                        return temp;
                    }
                    break;
                case "age":
                    int temp=Integer.parseInt(filter);
                    return userRepository.findByAge(temp);
            }
        }
       return null;
    }

    public boolean isUserBlocked(String username) {
        Optional<User> user = userRepository.findByUsername(username);
        return user.map(User::isLocked).orElse(false);
    }
    public boolean toggleUserBlockStatus(String username) {
        Optional<User> user = userRepository.findByUsername(username);
        if (user.isPresent()) {
            User u = user.get();
            u.setLocked(!u.isLocked());
            userRepository.save(u);
            return true;
        }
        return false;
    }
    public List<CarriedOutInfo> findCarriedOutByUsername(String username) {
        User user=userRepository.findByUsername(username).orElse(null);
        return userRepository.findCarriedOutByUserId(user.getId());
    }
    public List<Long> getAllUserIds() {
        return userRepository.findAllUserIds();
    }
    public boolean checkDifferentUser(Map<String, String> userData){
        if(!userRepository.existsByUsername(userData.get("username"))){
            if(!userRepository.existsByPhone(userData.get("phone").replace("-",""))){
                return true;
            }
        }
        return false;
    }
}
