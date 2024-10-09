'use server';

import { z } from 'zod';

import { sql } from '@vercel/postgres';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';



import { signIn } from '@/auth';
import { AuthError } from 'next-auth';


// Create
const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {

  let id1 = formData.get('customerId');
  let amount1 = formData.get('amount');
  let status1 = formData.get('status');

  id1 = (id1 ? id1 : 'd6e15727-9fe1-4961-8c5b-ea44a9bd81aa')
  amount1 = (amount1 ? amount1 : '0')
  status1 = (status1 ? status1 : 'pending')

  const { customerId, amount, status } = CreateInvoice.parse({
    customerId: id1,
    amount: amount1,
    status: status1,
  });


  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  try {

    await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  `;

  } catch {
    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }


  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');

  console.log("Data Added: ", id1, amount1, status1);
}


// Delete
export async function deleteInvoice(id: string) {
  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');

  } catch (error) {
    return { message: 'Database Error: Failed to Delete Invoice' };

  }

}




// Update
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  const amountInCents = amount * 100;

  try {

    await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
  `;

  } catch (error) {
    return { message: 'Database Error: Failed to Update Invoice.' };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}



// Authenticate
export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}