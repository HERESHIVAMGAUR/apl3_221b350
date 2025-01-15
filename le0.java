import java.util.*;
class Juet{
        int age;
        String name;
    public void set(){
        Scanner sc = new Scanner(System.in);
        System.out.print("enter your name: ");
        this.name=sc.nextLine();
        System.out.print("enter your Age: ");
        this.age = sc.nextInt();
    }
    public void get(){
        System.out.println("Name is : "+ name);
        System.out.println("Age is :" + age);
    }
}
    
public class Main
{
	public static void main(String[] args) {
	  Juet obj = new Juet();
	  obj.set();
	  obj.get();
	}
}
