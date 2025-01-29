// File: Pack2.java in package com.jiet

package com.jiet;

import com.juet.Pack1;  // Importing the Pack1 class

public class Pack2 {
    public static void main(String[] args) {
        // Creating an object of Pack1
        Pack1 pack1 = new Pack1();
        
        // This will cause a compilation error because display() is protected
        // pack1.display();
    }
}
