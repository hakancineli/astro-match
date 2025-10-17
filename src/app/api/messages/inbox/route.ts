import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get all messages where the user is the receiver
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:sender_id (
          username,
          profile_photo
        )
      `)
      .eq('receiver_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Group messages by sender
    const groupedMessages = data.reduce((acc: any, message: any) => {
      const senderId = message.sender_id
      if (!acc[senderId]) {
        acc[senderId] = {
          sender: message.sender,
          lastMessage: message,
          unreadCount: 1
        }
      } else {
        acc[senderId].unreadCount += 1
        if (new Date(message.created_at) > new Date(acc[senderId].lastMessage.created_at)) {
          acc[senderId].lastMessage = message
        }
      }
      return acc
    }, {})

    return NextResponse.json(Object.values(groupedMessages))
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
